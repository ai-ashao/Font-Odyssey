#!/usr/bin/env node
/** Offline build guard: never downloads fonts and requires no Python or npm dependencies. */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const previewStatuses = new Set(['GENERATED_SUBSET', 'ORIGINAL_UNMODIFIED_WEBFONT'])

export function validatePreviewCoverage(fonts, releases, index) {
  const issues = []
  if (!Array.isArray(fonts) || !Array.isArray(releases) || !fonts.length) {
    return ['A nonempty catalog and release registry are required.']
  }
  if (!isRecord(index) || index.version !== 1 || !isRecord(index.releases)) {
    return ['Preview coverage must be a version 1 index with a releases object.']
  }
  const bySlug = new Map()
  for (const font of fonts) {
    if (!isRecord(font) || typeof font.slug !== 'string' || bySlug.has(font.slug)) {
      issues.push('Invalid or duplicate catalog slug.')
      continue
    }
    bySlug.set(font.slug, font)
  }
  const seen = new Set()
  const expected = new Set()
  for (const release of releases) {
    if (!isRecord(release) || typeof release.slug !== 'string' || seen.has(release.slug)) {
      issues.push('Invalid or duplicate release slug.')
      continue
    }
    const slug = release.slug
    seen.add(slug)
    const font = bySlug.get(slug)
    if (
      !font ||
      font.finalStatus !== 'APPROVED' ||
      release.status !== 'VERIFIED' ||
      !/^[0-9a-f]{40}$/.test(release.sourceCommit ?? '') ||
      font.sourceCommit !== release.sourceCommit
    ) {
      issues.push(`${slug}: catalog/source/release gate mismatch.`)
    }
    if (!release.preview) {
      if (previewStatuses.has(release.previewStatus)) {
        issues.push(`${slug}: previewable release is missing its preview object.`)
      }
      continue
    }
    expected.add(slug)
    if (
      !previewStatuses.has(release.previewStatus) ||
      (release.previewStatus === 'GENERATED_SUBSET' && font?.reservedFontNames?.length)
    ) {
      issues.push(`${slug}: preview object violates the publishing policy.`)
    }
    const object = release.preview
    const entry = index.releases[slug]
    let validUrl = false
    try {
      const url = new URL(object.url)
      const prefix = `/fonts/${slug}/${release.releaseVersion}/`
      const file = url.pathname.slice(prefix.length)
      validUrl =
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
        /^[a-z0-9-]+$/.test(release.releaseVersion ?? '') &&
        url.origin === 'https://assets.fontodyssey.com' &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        url.pathname.startsWith(prefix) &&
        file.length > 0 &&
        !file.includes('/') &&
        !file.includes('%') &&
        !file.includes('..')
    } catch {
      /* Report malformed metadata below, never attempt a network request. */
    }
    if (
      !isRecord(object) ||
      !validUrl ||
      !/^[0-9a-f]{64}$/.test(object.sha256 ?? '') ||
      !Number.isInteger(object.bytes) ||
      object.bytes <= 0 ||
      object.bytes > 8 * 1024 * 1024
    ) {
      issues.push(`${slug}: invalid preview object metadata.`)
      continue
    }
    if (
      !isRecord(entry) ||
      entry.previewUrl !== object.url ||
      entry.sha256 !== object.sha256 ||
      entry.bytes !== object.bytes
    ) {
      issues.push(`${slug}: missing or stale character evidence.`)
      continue
    }
    const cps = entry.codepoints
    if (
      !Array.isArray(cps) ||
      cps.length === 0 ||
      cps.length > 100000 ||
      cps.some(
        (cp, i) =>
          !Number.isInteger(cp) ||
          cp < 0 ||
          cp > 0x10ffff ||
          (cp >= 0xd800 && cp <= 0xdfff) ||
          (i > 0 && cp <= cps[i - 1]),
      )
    ) {
      issues.push(`${slug}: invalid codepoints.`)
      continue
    }
    const text = entry.defaultText
    const available = new Set(cps)
    if (
      typeof text !== 'string' ||
      !text.trim() ||
      text.length > 140 ||
      [...text].some((ch) => !available.has(ch.codePointAt(0)))
    ) {
      issues.push(`${slug}: invalid default text.`)
    }
  }
  if (seen.size !== bySlug.size || [...bySlug.keys()].some((slug) => !seen.has(slug))) {
    issues.push('Catalog and release registry must match exactly.')
  }
  for (const slug of Object.keys(index.releases)) {
    if (!expected.has(slug)) issues.push(`${slug}: unexpected character evidence.`)
  }
  return issues
}

export function checkProject(root) {
  const read = (name) => JSON.parse(readFileSync(resolve(root, 'src/data', name), 'utf8'))
  return validatePreviewCoverage(
    read('font-catalog.json').fonts,
    read('font-asset-releases.json'),
    read('font-preview-coverage.json'),
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length !== 0 && (args.length !== 2 || args[0] !== '--root')) {
      throw new Error('Usage: node scripts/check-font-preview-coverage.mjs [--root PATH]')
    }
    const issues = checkProject(resolve(args[1] ?? fileURLToPath(new URL('..', import.meta.url))))
    if (issues.length) {
      console.error(`Preview build guard failed:\n${issues.map((item) => `- ${item}`).join('\n')}`)
      console.error('Generate real evidence with scripts/verify-font-usability.sh before building.')
      process.exitCode = 1
    } else {
      console.log('Preview build guard passed (offline metadata validation, not a live CORS test).')
    }
  } catch (error) {
    console.error(`Preview build guard failed: ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  }
}

#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const strict = process.argv.includes('--strict')

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
}

const catalog = readJson('src/data/font-catalog.json').fonts
const releases = readJson('src/data/font-asset-releases.json')
const coverage = readJson('src/data/font-preview-coverage.json')
const productConfig = fs.readFileSync(path.join(root, 'src/lib/product-config.ts'), 'utf8')

const catalogBySlug = new Map(catalog.map((font) => [font.slug, font]))
const releaseBySlug = new Map(releases.map((release) => [release.slug, release]))
const coverageBySlug = coverage.releases ?? {}
const blockers = []
const warnings = []

if (catalogBySlug.size !== catalog.length) blockers.push('Catalog contains duplicate slugs.')
if (releaseBySlug.size !== releases.length) {
  blockers.push('Release registry contains duplicate slugs.')
}
if (catalogBySlug.size !== releaseBySlug.size) {
  blockers.push('Catalog and release registry sizes differ.')
}

for (const slug of catalogBySlug.keys()) {
  if (!releaseBySlug.has(slug)) blockers.push(`${slug}: missing verified asset release.`)
}

const requiredLatin = new Set(
  [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'].map((character) =>
    character.codePointAt(0),
  ),
)

let previewable = 0
let indexed = 0
let latinPreviewable = 0
let latinReady = 0

for (const release of releases) {
  if (!release.preview) continue
  previewable += 1
  const entry = coverageBySlug[release.slug]
  if (!entry) {
    blockers.push(`${release.slug}: missing preview coverage evidence.`)
    continue
  }
  indexed += 1
  if (
    entry.previewUrl !== release.preview.url ||
    entry.sha256 !== release.preview.sha256 ||
    entry.bytes !== release.preview.bytes
  ) {
    blockers.push(`${release.slug}: preview coverage evidence is stale.`)
  }

  const font = catalogBySlug.get(release.slug)
  const isLatinOnly =
    font?.subsets.includes('latin') &&
    !font.subsets.some(
      (subset) => subset.startsWith('chinese-') || subset === 'japanese' || subset === 'korean',
    )
  if (!isLatinOnly) continue
  latinPreviewable += 1
  const available = new Set(entry.codepoints ?? [])
  const missing = [...requiredLatin].filter((codepoint) => !available.has(codepoint))
  if (missing.length === 0) {
    latinReady += 1
  } else {
    blockers.push(
      `${release.slug}: Latin preview is missing ${missing.length} basic A-Z/a-z/0-9 ` +
        'characters; regenerate and republish preview assets.',
    )
  }
}

if (coverage.version !== 1) {
  blockers.push('Preview coverage index version must remain 1 for the current contract.')
}
if (!/indexingEnabled:\s*false/.test(productConfig)) {
  warnings.push(
    'Temporary noindex guard is not enabled. Confirm launch approval before deployment.',
  )
}

const summary = {
  catalogFamilies: catalog.length,
  releases: releases.length,
  previewableReleases: previewable,
  indexedPreviewReleases: indexed,
  latinPreviewable,
  latinPreviewReady: latinReady,
  indexingGuard: /indexingEnabled:\s*false/.test(productConfig) ? 'ON' : 'OFF',
  blockers,
  warnings,
}

console.log(JSON.stringify(summary, null, 2))
if (strict && blockers.length > 0) process.exit(1)

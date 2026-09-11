import type { FontApprovalFacts, FontAssetRelease } from './font-publishing'

/** These are the input strings used by package_approved.py, NOT a claim of glyph coverage. */
export function packagedSample(font: Pick<FontApprovalFacts, 'languageGroup'>): string {
  switch (font.languageGroup) {
    case 'Chinese':
      return '字型探索 FontOdyssey 0123456789'
    case 'Japanese':
      return '文字の旅 フォント FontOdyssey 0123456789'
    case 'Korean':
      return '글꼴 여행 폰트 FontOdyssey 0123456789'
    default:
      return 'Sphinx of black quartz, judge my vow.'
  }
}

export type PreviewEvidence = {
  previewUrl: string
  sha256: string
  bytes: number
  codepoints: number[]
  defaultText: string
}

type EvidenceIndex = { version?: unknown; releases?: unknown }

/** Never attach evidence from another release, including an older release of the same family. */
export function previewEvidence(
  index: unknown,
  release?: FontAssetRelease,
): PreviewEvidence | undefined {
  if (
    !release?.preview ||
    !['GENERATED_SUBSET', 'ORIGINAL_UNMODIFIED_WEBFONT'].includes(release.previewStatus) ||
    !index ||
    typeof index !== 'object'
  )
    return undefined
  const source = index as EvidenceIndex
  if (source.version !== 1 || !source.releases || typeof source.releases !== 'object')
    return undefined
  const item = (source.releases as Record<string, unknown>)[release.slug]
  if (!item || typeof item !== 'object') return undefined
  const entry = item as Partial<PreviewEvidence>
  if (
    entry.previewUrl !== release.preview.url ||
    entry.sha256 !== release.preview.sha256 ||
    entry.bytes !== release.preview.bytes
  )
    return undefined
  if (
    !Array.isArray(entry.codepoints) ||
    !entry.codepoints.length ||
    entry.codepoints.length > 100000
  )
    return undefined
  let previous = -1
  for (const cp of entry.codepoints) {
    if (
      !Number.isInteger(cp) ||
      cp < 0 ||
      cp > 0x10ffff ||
      (cp >= 0xd800 && cp <= 0xdfff) ||
      cp <= previous
    )
      return undefined
    previous = cp
  }
  if (
    typeof entry.defaultText !== 'string' ||
    !entry.defaultText.trim() ||
    entry.defaultText.length > 140
  )
    return undefined
  const available = new Set(entry.codepoints)
  if ([...entry.defaultText].some((ch) => !available.has(ch.codePointAt(0) as number)))
    return undefined
  return entry as PreviewEvidence
}

/** Newlines are layout controls. Space, emoji, variation selectors and combining marks are not silently ignored. */
export function missingPreviewCharacters(text: string, codepoints: readonly number[]): string[] {
  const available = new Set(codepoints)
  return [
    ...new Set(
      [...text].filter(
        (ch) =>
          ch !== '\n' && ch !== '\r' && ch !== '\t' && !available.has(ch.codePointAt(0) as number),
      ),
    ),
  ]
}

export function codepointLabel(character: string): string {
  return `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`
}

export function formatPackageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}

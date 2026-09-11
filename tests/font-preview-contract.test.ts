import { describe, expect, it } from 'vitest'
import { fontCatalog } from '@/lib/font-catalog'
import {
  codepointLabel,
  formatPackageBytes,
  missingPreviewCharacters,
  packagedSample,
  previewEvidence,
} from '@/lib/font-preview-contract'
import { verifiedAssetReleaseForSlug } from '@/lib/font-publication'

describe('truthful preview contract', () => {
  it('uses font language, not the interface locale, for the built-in specimen', () => {
    expect(packagedSample({ languageGroup: 'Latin' })).toBe('Sphinx of black quartz, judge my vow.')
    expect(packagedSample({ languageGroup: 'Chinese' })).toContain('字型探索')
  })
  it('reports missing Unicode characters, including emoji, in the subset rather than the full download', () => {
    expect(missingPreviewCharacters('AA中😀😀', [65])).toEqual(['中', '😀'])
    expect(codepointLabel('😀')).toBe('U+1F600')
    expect(missingPreviewCharacters('A\n\r\t', [65])).toEqual([])
  })
  it('does not silently normalize accents or variation selectors', () => {
    expect(missingPreviewCharacters('e\u0301', [101])).toEqual(['\u0301'])
    expect(missingPreviewCharacters('A\uFE0F', [65])).toEqual(['\uFE0F'])
  })
  it('does not attach unverified or stale evidence to a release', () => {
    const release = verifiedAssetReleaseForSlug('inter')
    expect(release?.preview).toBeDefined()
    if (!release?.preview) throw new Error('Inter release is missing')
    const entry = {
      previewUrl: release.preview.url,
      sha256: release.preview.sha256,
      bytes: release.preview.bytes,
      codepoints: [65],
      defaultText: 'A',
    }
    expect(previewEvidence({ version: 1, releases: { inter: entry } }, release)).toEqual(entry)
    expect(
      previewEvidence(
        { version: 1, releases: { inter: { ...entry, sha256: '0'.repeat(64) } } },
        release,
      ),
    ).toBeUndefined()
    expect(
      previewEvidence(
        { version: 1, releases: { inter: { ...entry, defaultText: 'AB' } } },
        release,
      ),
    ).toBeUndefined()
    expect(
      previewEvidence(
        { version: 1, releases: { inter: { ...entry, codepoints: [65, 65] } } },
        release,
      ),
    ).toBeUndefined()
  })
  it('does not make an unpreviewable release previewable', () => {
    const font = fontCatalog.find((item) => item.slug === 'raleway')
    expect(font).toBeDefined()
    expect(
      previewEvidence({ version: 1, releases: {} }, verifiedAssetReleaseForSlug('raleway')),
    ).toBeUndefined()
  })
  it('uses explicit binary units and handles invalid sizes', () => {
    expect(formatPackageBytes(1024)).toBe('1.0 KiB')
    expect(formatPackageBytes(1024 * 1024)).toBe('1.0 MiB')
    expect(formatPackageBytes(Number.NaN)).toBe('—')
  })
})

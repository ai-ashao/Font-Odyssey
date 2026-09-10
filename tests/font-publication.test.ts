import { describe, expect, it } from 'vitest'
import { fontDownloadSources, fontR2DownloadUrl } from '@/lib/font-assets'
import { fontCatalog } from '@/lib/font-catalog'
import {
  fontLocaleIndexable,
  publishedFontForLocale,
  verifiedAssetReleaseForSlug,
} from '@/lib/font-publication'
import { validateAssetRelease } from '@/lib/font-publishing'
import { fontAssetReleases } from '@/modules/font-asset-releases'

describe('font publishing gate', () => {
  it('contains every remotely verified release and preserves the Pilot set', () => {
    const slugs = fontAssetReleases.map((release) => release.slug)
    expect(slugs).toEqual(
      expect.arrayContaining(['inter', 'raleway', 'notoseriftc', 'notoserifsc', 'firasans']),
    )
    expect(slugs).toEqual(fontCatalog.map((font) => font.slug))
    expect(slugs).toHaveLength(149)
    expect(slugs).not.toContain('robotocondensed')
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(fontAssetReleases.flatMap(validateAssetRelease)).toEqual([])
  })

  it('never infers R2 availability from a slug or base URL', () => {
    const unverified = fontCatalog.find(
      (font) => !fontAssetReleases.some((release) => release.slug === font.slug),
    )
    if (!unverified) return

    expect(verifiedAssetReleaseForSlug(unverified.slug)).toBeUndefined()
    expect(fontR2DownloadUrl(unverified)).toBeUndefined()
    expect(fontDownloadSources(unverified, 'en')[0]?.id).toBe('official')
  })

  it('makes indexability equivalent to a fully eligible PublishedFont', () => {
    for (const font of fontCatalog) {
      for (const locale of ['en', 'zh-CN', 'zh-TW'] as const) {
        expect(fontLocaleIndexable(font, locale)).toBe(
          Boolean(publishedFontForLocale(font.slug, locale)),
        )
      }
    }
  })

  it('builds published SEO copy from the remotely verified preview state', () => {
    const inter = publishedFontForLocale('inter', 'en')
    const raleway = publishedFontForLocale('raleway', 'en')
    expect(inter).toBeDefined()
    expect(raleway).toBeDefined()
    if (!inter || !raleway) return

    expect(inter.release.previewStatus).toBe('GENERATED_SUBSET')
    expect(inter.content.en?.description).toContain('verified live preview')

    expect(raleway.release.previewStatus).toBe('UNAVAILABLE_RFN')
    expect(raleway.content.en?.description).toContain('Reserved Font Name preview restrictions')
    expect(raleway.content.en?.description).not.toContain('verified live preview')
  })
})

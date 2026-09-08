import { describe, expect, it } from 'vitest'
import { fontDownloadSources, fontR2DownloadUrl } from '@/lib/font-assets'
import { fontCatalog } from '@/lib/font-catalog'
import {
  fontLocaleIndexable,
  publishedFontForLocale,
  verifiedAssetReleaseForSlug,
} from '@/lib/font-publication'
import { fontAssetReleases } from '@/modules/font-asset-releases'

describe('font publishing gate', () => {
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
})

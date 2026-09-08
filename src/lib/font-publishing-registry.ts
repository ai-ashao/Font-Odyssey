import { fontCatalog } from '@/lib/font-catalog'
import {
  type FontEditorialContent,
  fontPageEligible,
  type PublishedFont,
  type PublishingLocale,
} from '@/lib/font-publishing'
import { fontAssetReleases } from '@/modules/font-asset-releases'
import { fontEditorialContent } from '@/modules/font-editorial-content'

export type FontDetailRoute = {
  pageId: `font:${string}`
  slug: string
  locale: PublishingLocale
  path: string
  font: PublishedFont
}

export function fontDetailPath(slug: string, locale: PublishingLocale): string {
  if (locale === 'zh-CN') return `/zh/fonts/${slug}`
  if (locale === 'zh-TW') return `/zh-tw/fonts/${slug}`
  return `/fonts/${slug}`
}

export function getEligiblePublishedFont(
  slug: string,
  locale: PublishingLocale,
): PublishedFont | undefined {
  const facts = fontCatalog.find((font) => font.slug === slug)
  const release = fontAssetReleases.find((item) => item.slug === slug)
  if (!facts || !release) return undefined

  const content = Object.fromEntries(
    fontEditorialContent.filter((item) => item.slug === slug).map((item) => [item.locale, item]),
  ) as Partial<Record<PublishingLocale, FontEditorialContent>>
  const font: PublishedFont = { facts, release, content }
  return fontPageEligible(font, locale) ? font : undefined
}

export function fontDetailRoutes(): FontDetailRoute[] {
  return fontAssetReleases.flatMap((release) =>
    (['en', 'zh-CN', 'zh-TW'] as const).flatMap((locale) => {
      const font = getEligiblePublishedFont(release.slug, locale)
      if (!font) return []
      return [
        {
          pageId: `font:${release.slug}` as const,
          slug: release.slug,
          locale,
          path: fontDetailPath(release.slug, locale),
          font,
        },
      ]
    }),
  )
}

export function fontDetailSitemapPaths(): string[] {
  return fontDetailRoutes().map((route) => route.path)
}

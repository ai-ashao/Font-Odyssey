import type { Locale } from '@/i18n/config'
import { fontAssetReleases } from '@/modules/font-asset-releases'
import { fontEditorialContentFor } from '@/modules/font-editorial-content'
import { type FontCatalogItem, findFontBySlug } from './font-catalog'
import {
  type FontAssetRelease,
  fontPageEligible,
  type PublishedFont,
  validateAssetRelease,
} from './font-publishing'

const releaseBySlug = new Map(fontAssetReleases.map((release) => [release.slug, release]))
const publishingLocales = ['en', 'zh-CN', 'zh-TW'] as const satisfies ReadonlyArray<Locale>

export function verifiedAssetReleaseForSlug(slug: string): FontAssetRelease | undefined {
  const release = releaseBySlug.get(slug)
  if (!release || validateAssetRelease(release).length > 0) return undefined

  const facts = findFontBySlug(slug)
  if (!facts || release.sourceCommit !== facts.sourceCommit) return undefined
  return release
}

export function assembledPublishedFont(slug: string): PublishedFont | undefined {
  const facts = findFontBySlug(slug)
  const release = verifiedAssetReleaseForSlug(slug)
  if (!facts || !release) return undefined

  const content = Object.fromEntries(
    publishingLocales.map((locale) => [
      locale,
      fontEditorialContentFor(facts, locale, release.previewStatus),
    ]),
  ) as PublishedFont['content']

  return { facts, release, content }
}

export function publishedFontForLocale(slug: string, locale: Locale): PublishedFont | undefined {
  const font = assembledPublishedFont(slug)
  if (!font || !fontPageEligible(font, locale)) return undefined
  return font
}

export function fontLocaleIndexable(font: FontCatalogItem | string, locale: Locale): boolean {
  const slug = typeof font === 'string' ? font : font.slug
  return Boolean(publishedFontForLocale(slug, locale))
}

export function indexableFontLocales(font: FontCatalogItem | string): Locale[] {
  const slug = typeof font === 'string' ? font : font.slug
  return publishingLocales.filter((locale) => fontLocaleIndexable(slug, locale))
}

export function fontDetailModelForLocale(
  slug: string,
  locale: Locale,
): PublishedFont | FontCatalogItem | undefined {
  return publishedFontForLocale(slug, locale) ?? findFontBySlug(slug)
}

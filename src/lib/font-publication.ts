import type { Locale } from '@/i18n/config'
import { fontAssetReleases } from '@/modules/font-asset-releases'
import { fontEditorialContent } from '@/modules/font-editorial-content'
import { type FontCatalogItem, findFontBySlug } from './font-catalog'
import {
  type FontAssetRelease,
  type FontEditorialContent,
  fontPageEligible,
  type PublishedFont,
  validateAssetRelease,
} from './font-publishing'

const releaseBySlug = new Map(fontAssetReleases.map((release) => [release.slug, release]))
const editorialBySlug = new Map<string, Partial<Record<Locale, FontEditorialContent>>>()

for (const content of fontEditorialContent) {
  const localized = editorialBySlug.get(content.slug) ?? {}
  localized[content.locale] = {
    ...content,
    about: [...content.about],
    useCases: [...content.useCases],
  }
  editorialBySlug.set(content.slug, localized)
}

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

  return {
    facts,
    release,
    content: editorialBySlug.get(slug) ?? {},
  }
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
  return (['en', 'zh-CN', 'zh-TW'] as const).filter((locale) => fontLocaleIndexable(slug, locale))
}

export function fontDetailModelForLocale(
  slug: string,
  locale: Locale,
): PublishedFont | FontCatalogItem | undefined {
  return publishedFontForLocale(slug, locale) ?? findFontBySlug(slug)
}

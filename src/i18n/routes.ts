import { fontLocaleAlternatesForPath, fontSitemapPaths } from '@/lib/font-routes'
import { isLegalProfileLaunchReady } from '@/lib/legal'
import { toolLocaleAlternatesForPath, toolSitemapPaths } from '@/lib/tool-registry'
import { legalProfile } from '@/modules/legal-profile'
import { toolRegistry } from '@/modules/tool-registry'
import { defaultLocale, type Locale, localeConfig, supportedLocales } from './config'

export type PublicPageId = 'home' | 'fonts' | 'about' | 'contact' | 'privacy' | 'terms'
export type LocalizedPaths = Partial<Record<Locale, string>>

export type PublicPageRoute = {
  id: PublicPageId
  indexable: boolean
  paths: LocalizedPaths
}

const legalPagesIndexable = isLegalProfileLaunchReady(legalProfile)
const staticPages: PublicPageRoute[] = [
  { id: 'home', indexable: true, paths: { en: '/', 'zh-CN': '/zh', 'zh-TW': '/zh-tw' } },
  {
    id: 'fonts',
    indexable: true,
    paths: { en: '/fonts', 'zh-CN': '/zh/fonts', 'zh-TW': '/zh-tw/fonts' },
  },
  { id: 'about', indexable: true, paths: { en: '/about' } },
  { id: 'contact', indexable: true, paths: { en: '/contact' } },
  { id: 'privacy', indexable: legalPagesIndexable, paths: { en: '/privacy-policy' } },
  { id: 'terms', indexable: legalPagesIndexable, paths: { en: '/terms-of-service' } },
]

export const publicPageRoutes: ReadonlyArray<PublicPageRoute> = staticPages

export type LocaleAlternate = {
  locale: Locale
  path: string
  label: string
  shortLabel: string
}

export function localizedPath(pageId: PublicPageId, locale: Locale): string | undefined {
  return publicPageRoutes.find((page) => page.id === pageId)?.paths[locale]
}

export function isPublicPageIndexable(pageId: PublicPageId): boolean {
  const page = publicPageRoutes.find((candidate) => candidate.id === pageId)
  if (!page) throw new Error(`Unknown public page: ${pageId}`)
  return page.indexable
}

export function localizedPathOrDefault(pageId: PublicPageId, locale: Locale): string {
  const page = publicPageRoutes.find((candidate) => candidate.id === pageId)
  const path = page?.paths[locale] || page?.paths[defaultLocale]
  if (!path) throw new Error(`Missing localized route for ${pageId}`)
  return path
}

export function resolvePublicPage(
  pathname: string,
): { pageId: PublicPageId; locale: Locale; path: string } | undefined {
  const normalized = normalizePath(pathname)
  for (const page of publicPageRoutes) {
    for (const locale of supportedLocales) {
      const path = page.paths[locale]
      if (path && normalizePath(path) === normalized) return { pageId: page.id, locale, path }
    }
  }
  return undefined
}

export function localeAlternatesForPath(pathname: string): LocaleAlternate[] {
  const current = resolvePublicPage(pathname)

  if (current) {
    const page = publicPageRoutes.find((candidate) => candidate.id === current.pageId)
    if (!page) return []

    return supportedLocales.flatMap((locale) => {
      const path = page.paths[locale]
      if (!path || locale === current.locale) return []
      return [
        {
          locale,
          path,
          label: localeConfig[locale].label,
          shortLabel: localeConfig[locale].shortLabel,
        },
      ]
    })
  }

  const fontAlternates = fontLocaleAlternatesForPath(pathname)
  if (fontAlternates.length > 0) {
    return fontAlternates.map((alternate) => ({
      ...alternate,
      label: localeConfig[alternate.locale].label,
      shortLabel: localeConfig[alternate.locale].shortLabel,
    }))
  }

  return toolLocaleAlternatesForPath(toolRegistry, pathname)
}

export function hreflangAlternates(pageId: PublicPageId): Array<{
  locale: Locale | 'x-default'
  path: string
}> {
  const page = publicPageRoutes.find((candidate) => candidate.id === pageId)
  if (!page) throw new Error(`Unknown public page: ${pageId}`)
  const localized = supportedLocales.flatMap((locale) => {
    const path = page.paths[locale]
    return path ? [{ locale, path }] : []
  })
  if (localized.length < 2) return []

  const fallback = page.paths[defaultLocale] || localized[0]?.path
  return fallback ? [...localized, { locale: 'x-default', path: fallback }] : localized
}

export function sitemapPaths(): string[] {
  return Array.from(
    new Set([
      ...publicPageRoutes.flatMap((page) =>
        page.indexable
          ? supportedLocales.flatMap((locale) => {
              const path = page.paths[locale]
              return path ? [path] : []
            })
          : [],
      ),
      ...fontSitemapPaths(),
      ...toolSitemapPaths(toolRegistry),
    ]),
  )
}

function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] || '/'
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

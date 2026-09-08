import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { localeFromPathname, supportedLocales } from '../src/i18n/config'
import { shellMessages } from '../src/i18n/messages'
import {
  hreflangAlternates,
  localeAlternatesForPath,
  publicPageRoutes,
  resolvePublicPage,
  sitemapPaths,
} from '../src/i18n/routes'
import { fontSitemapPaths } from '../src/lib/font-routes'
import { isLegalProfileLaunchReady } from '../src/lib/legal'
import { legalProfile } from '../src/modules/legal-profile'

describe('locale-aware route registry', () => {
  it('detects only exact locale path prefixes', () => {
    expect(localeFromPathname('/')).toBe('en')
    expect(localeFromPathname('/fonts')).toBe('en')
    expect(localeFromPathname('/zh')).toBe('zh-CN')
    expect(localeFromPathname('/zh/missing')).toBe('zh-CN')
    expect(localeFromPathname('/zh-tw')).toBe('zh-TW')
    expect(localeFromPathname('/zh-tw/font/inter')).toBe('zh-TW')
    expect(localeFromPathname('/zh-fake')).toBe('en')
  })

  it('keeps every registered static path unique and resolvable to its page identity', () => {
    const paths = publicPageRoutes.flatMap((page) =>
      supportedLocales.flatMap((locale) => {
        const path = page.paths[locale]
        if (!path) return []
        expect(resolvePublicPage(path)).toEqual({ pageId: page.id, locale, path })
        return [path]
      }),
    )
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('creates reciprocal hreflang only for real localized equivalents', () => {
    expect(hreflangAlternates('home')).toEqual([
      { locale: 'en', path: '/' },
      { locale: 'zh-CN', path: '/zh' },
      { locale: 'zh-TW', path: '/zh-tw' },
      { locale: 'x-default', path: '/' },
    ])
    expect(hreflangAlternates('fonts')).toHaveLength(4)
  })

  it('offers locale switches for static and font-entity routes', () => {
    expect(localeAlternatesForPath('/')).toMatchObject([
      { locale: 'zh-CN', path: '/zh' },
      { locale: 'zh-TW', path: '/zh-tw' },
    ])
    expect(localeAlternatesForPath('/font/inter')).toMatchObject([
      { locale: 'zh-CN', path: '/zh/font/inter' },
      { locale: 'zh-TW', path: '/zh-tw/font/inter' },
    ])
    expect(localeAlternatesForPath('/missing')).toEqual([])
  })

  it('derives sitemap paths from static and font registries', () => {
    const staticExpected = publicPageRoutes.flatMap((page) =>
      page.indexable
        ? supportedLocales.flatMap((locale) => {
            const path = page.paths[locale]
            return path ? [path] : []
          })
        : [],
    )

    expect(sitemapPaths()).toEqual(
      expect.arrayContaining([...staticExpected, ...fontSitemapPaths()]),
    )
    expect(new Set(sitemapPaths()).size).toBe(sitemapPaths().length)

    const legalIndexable = isLegalProfileLaunchReady(legalProfile)
    expect(publicPageRoutes.find((page) => page.id === 'privacy')?.indexable).toBe(legalIndexable)
    expect(publicPageRoutes.find((page) => page.id === 'terms')?.indexable).toBe(legalIndexable)
  })

  it('ships structurally complete message dictionaries for every supported locale', () => {
    expect(Object.keys(shellMessages).sort()).toEqual([...supportedLocales].sort())
    expect(messageShape(shellMessages['zh-CN'])).toEqual(messageShape(shellMessages.en))
    expect(messageShape(shellMessages['zh-TW'])).toEqual(messageShape(shellMessages.en))
  })

  it('keeps localized home route files as thin wrappers around one shared page component', () => {
    const englishRoute = readFileSync('src/routes/index.tsx', 'utf8')
    const chineseRoute = readFileSync('src/routes/zh.index.tsx', 'utf8')
    const traditionalRoute = readFileSync('src/routes/zh-tw.index.tsx', 'utf8')

    expect(englishRoute).toContain('<ProductHome locale="en" />')
    expect(chineseRoute).toContain('<ProductHome locale="zh-CN" />')
    expect(traditionalRoute).toContain('<ProductHome locale="zh-TW" />')
  })
})

function messageShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(messageShape)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, messageShape(child)]),
    )
  }
  return typeof value
}

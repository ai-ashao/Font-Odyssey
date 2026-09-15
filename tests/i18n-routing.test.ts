import { existsSync, readFileSync } from 'node:fs'
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

describe('English-only public route registry', () => {
  it('keeps English as the only active locale for every pathname', () => {
    expect(supportedLocales).toEqual(['en'])
    expect(localeFromPathname('/')).toBe('en')
    expect(localeFromPathname('/fonts')).toBe('en')
    expect(localeFromPathname('/zh')).toBe('en')
    expect(localeFromPathname('/zh/missing')).toBe('en')
    expect(localeFromPathname('/zh-tw')).toBe('en')
    expect(localeFromPathname('/zh-tw/font/inter')).toBe('en')
  })

  it('keeps every active static path unique and resolvable to its page identity', () => {
    const paths = publicPageRoutes.flatMap((page) =>
      supportedLocales.flatMap((locale) => {
        const path = page.paths[locale]
        if (!path) return []
        expect(resolvePublicPage(path)).toEqual({ pageId: page.id, locale, path })
        return [path]
      }),
    )
    expect(new Set(paths).size).toBe(paths.length)
    expect(resolvePublicPage('/zh')).toBeUndefined()
    expect(resolvePublicPage('/zh-tw')).toBeUndefined()
  })

  it('does not emit hreflang or locale switches for a single-language site', () => {
    expect(hreflangAlternates('home')).toEqual([])
    expect(hreflangAlternates('fonts')).toEqual([])
    expect(hreflangAlternates('about')).toEqual([])
    expect(hreflangAlternates('contact')).toEqual([])

    expect(localeAlternatesForPath('/')).toEqual([])
    expect(localeAlternatesForPath('/font/inter')).toEqual([])
    expect(localeAlternatesForPath('/missing')).toEqual([])
  })

  it('derives an English-only sitemap from static and font registries', () => {
    const paths = sitemapPaths()
    const staticExpected = publicPageRoutes.flatMap((page) =>
      page.indexable
        ? supportedLocales.flatMap((locale) => {
            const path = page.paths[locale]
            return path ? [path] : []
          })
        : [],
    )

    expect(paths).toEqual(expect.arrayContaining([...staticExpected, ...fontSitemapPaths()]))
    expect(new Set(paths).size).toBe(paths.length)

    expect(publicPageRoutes.find((page) => page.id === 'privacy')?.indexable).toBe(true)
    expect(publicPageRoutes.find((page) => page.id === 'terms')?.indexable).toBe(true)
    expect(paths).toEqual(expect.arrayContaining(['/privacy-policy', '/terms-of-service']))
    expect(paths.some((path) => path === '/zh' || path.startsWith('/zh/'))).toBe(false)
    expect(paths.some((path) => path === '/zh-tw' || path.startsWith('/zh-tw/'))).toBe(false)
  })

  it('keeps dormant message dictionaries structurally compatible for future localization', () => {
    expect(messageShape(shellMessages['zh-CN'])).toEqual(messageShape(shellMessages.en))
    expect(messageShape(shellMessages['zh-TW'])).toEqual(messageShape(shellMessages.en))
  })

  it('keeps only the English public route wrappers active', () => {
    const englishHomeRoute = readFileSync('src/routes/index.tsx', 'utf8')
    const englishAboutRoute = readFileSync('src/routes/about.tsx', 'utf8')
    const englishContactRoute = readFileSync('src/routes/contact.tsx', 'utf8')

    expect(englishHomeRoute).toContain('<ProductHome locale="en" />')
    expect(englishAboutRoute).toContain('<AboutPage locale="en" />')
    expect(englishContactRoute).toContain('<ContactPage locale="en" />')

    for (const path of [
      'src/routes/zh.index.tsx',
      'src/routes/zh.about.tsx',
      'src/routes/zh.contact.tsx',
      'src/routes/zh.font.$slug.tsx',
      'src/routes/zh.fonts.$hub.tsx',
      'src/routes/zh.fonts.index.tsx',
      'src/routes/zh-tw.index.tsx',
      'src/routes/zh-tw.about.tsx',
      'src/routes/zh-tw.contact.tsx',
      'src/routes/zh-tw.font.$slug.tsx',
      'src/routes/zh-tw.fonts.$hub.tsx',
      'src/routes/zh-tw.fonts.index.tsx',
    ]) {
      expect(existsSync(path)).toBe(false)
    }
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

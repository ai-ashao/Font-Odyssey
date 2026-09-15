import { describe, expect, it } from 'vitest'
import { findFontBySlug, fontCatalog } from '@/lib/font-catalog'
import { indexableFontLocales } from '@/lib/font-publication'
import {
  findFontHub,
  fontDetailAlternates,
  fontHubPath,
  fontLocaleAlternatesForPath,
  fontPath,
  fontSitemapPaths,
  fontsForHub,
} from '@/lib/font-routes'

describe('font entity and hub routes', () => {
  it('keeps locale path helpers available but publishes English as the only active alternate', () => {
    const inter = findFontBySlug('inter')
    expect(inter).toBeDefined()
    if (!inter) return
    expect(fontPath(inter, 'en')).toBe('/font/inter')
    expect(fontPath(inter, 'zh-CN')).toBe('/zh/font/inter')
    expect(fontPath(inter, 'zh-TW')).toBe('/zh-tw/font/inter')
    expect(fontDetailAlternates(inter)).toEqual([{ locale: 'en', path: '/font/inter' }])
  })

  it('builds language and category hubs from real inventory', () => {
    const chinese = findFontHub('chinese')
    const sans = findFontHub('sans-serif')
    const display = findFontHub('display')
    expect(chinese).toBeDefined()
    expect(sans).toBeDefined()
    expect(display).toBeDefined()
    if (!chinese || !sans || !display) return
    expect(fontHubPath(chinese, 'zh-CN')).toBe('/zh/fonts/chinese')
    expect(fontHubPath(display, 'en')).toBe('/fonts/display')
    expect(fontsForHub(chinese).length).toBeGreaterThan(0)
    expect(fontsForHub(sans).every((font) => font.category === 'Sans Serif')).toBe(true)
    expect(fontsForHub(display).every((font) => font.category === 'Display')).toBe(true)
  })

  it('does not expose user-facing locale switches on active catalog routes', () => {
    expect(fontLocaleAlternatesForPath('/font/inter')).toEqual([])
    expect(fontLocaleAlternatesForPath('/fonts/chinese')).toEqual([])
  })

  it('puts only English publishing-gate-eligible font details in the sitemap', () => {
    const paths = new Set(fontSitemapPaths())
    for (const font of fontCatalog) {
      const indexable = new Set(indexableFontLocales(font))
      expect(paths.has(fontPath(font, 'en'))).toBe(indexable.has('en'))
      expect(paths.has(fontPath(font, 'zh-CN'))).toBe(false)
      expect(paths.has(fontPath(font, 'zh-TW'))).toBe(false)
    }

    expect(paths.has('/fonts/chinese')).toBe(true)
    expect(paths.has('/zh/fonts/chinese')).toBe(false)
    expect(paths.has('/zh-tw/fonts/chinese')).toBe(false)
    expect(paths.has('/fonts/display')).toBe(true)
    expect(paths.has('/zh/fonts/display')).toBe(false)
    expect(paths.has('/zh-tw/fonts/display')).toBe(false)
    expect(paths.size).toBe(fontSitemapPaths().length)
  })
})

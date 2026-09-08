import { describe, expect, it } from 'vitest'
import { findFontBySlug, fontCatalog } from '@/lib/font-catalog'
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
  it('builds stable locale-aware font paths', () => {
    const inter = findFontBySlug('inter')
    expect(inter).toBeDefined()
    if (!inter) return
    expect(fontPath(inter, 'en')).toBe('/font/inter')
    expect(fontPath(inter, 'zh-CN')).toBe('/zh/font/inter')
    expect(fontPath(inter, 'zh-TW')).toBe('/zh-tw/font/inter')
    expect(fontDetailAlternates(inter)).toHaveLength(3)
  })

  it('builds language and category hubs from real inventory', () => {
    const chinese = findFontHub('chinese')
    const sans = findFontHub('sans-serif')
    expect(chinese).toBeDefined()
    expect(sans).toBeDefined()
    if (!chinese || !sans) return
    expect(fontHubPath(chinese, 'zh-CN')).toBe('/zh/fonts/chinese')
    expect(fontsForHub(chinese).length).toBeGreaterThan(0)
    expect(fontsForHub(sans).every((font) => font.category === 'Sans Serif')).toBe(true)
  })

  it('generates reciprocal locale alternates for font routes', () => {
    expect(fontLocaleAlternatesForPath('/font/inter')).toEqual([
      { locale: 'zh-CN', path: '/zh/font/inter' },
      { locale: 'zh-TW', path: '/zh-tw/font/inter' },
    ])
    expect(fontLocaleAlternatesForPath('/zh/font/inter')).toEqual([
      { locale: 'en', path: '/font/inter' },
      { locale: 'zh-TW', path: '/zh-tw/font/inter' },
    ])
  })

  it('publishes every approved font in every shipped locale', () => {
    const paths = fontSitemapPaths()
    expect(paths).toContain('/font/inter')
    expect(paths).toContain('/zh/font/inter')
    expect(paths).toContain('/zh-tw/font/inter')
    expect(paths.length).toBeGreaterThan(fontCatalog.length * 3)
    expect(new Set(paths).size).toBe(paths.length)
  })
})

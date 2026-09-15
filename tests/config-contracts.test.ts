import { describe, expect, it } from 'vitest'
import { supportedLocales } from '@/i18n/config'
import { hreflangAlternates, sitemapPaths } from '@/i18n/routes'
import { filterAndSortFonts, fontCatalog, fontLanguages } from '@/lib/font-catalog'
import { fontSitemapPaths } from '@/lib/font-routes'
import { validateLegalProfile } from '@/lib/legal'
import { productConfig, validateProductConfig } from '@/lib/product-config'
import { validateSeoFirstProductState } from '@/lib/seo-first-validation'
import {
  localizedNavigationValue,
  siteNavigation,
  validateToolSiteNavigation,
} from '@/lib/site-navigation'
import { legalProfile } from '@/modules/legal-profile'
import { toolRegistry } from '@/modules/tool-registry'

describe('FontOdyssey configuration', () => {
  it('uses the real product identity and Tool mode', () => {
    expect(productConfig.mode).toBe('tool')
    expect(productConfig.indexingEnabled).toBe(true)
    expect(productConfig.brand.name).toBe('FontOdyssey')
    expect(validateProductConfig(productConfig)).toEqual([])
    expect(validateSeoFirstProductState()).toEqual([])
  })

  it('keeps navigation and legal configuration valid', () => {
    expect(validateToolSiteNavigation(siteNavigation, toolRegistry)).toEqual([])
    expect(validateLegalProfile(legalProfile)).toEqual([])
  })

  it('keeps dormant localized navigation destinations available for future expansion', () => {
    expect(siteNavigation.header.links).toContain('tools')
    expect(siteNavigation.header.customLinks?.map((link) => link.id)).toEqual([
      'collections',
      'commercial',
      'variable',
    ])

    const commercial = siteNavigation.header.customLinks?.find((link) => link.id === 'commercial')
    const variable = siteNavigation.header.customLinks?.find((link) => link.id === 'variable')
    expect(commercial).toBeDefined()
    expect(variable).toBeDefined()
    if (!commercial || !variable) return

    expect(localizedNavigationValue(commercial.href, 'en')).toBe('/fonts/free-commercial')
    expect(localizedNavigationValue(commercial.href, 'zh-CN')).toBe('/zh/fonts/free-commercial')
    expect(localizedNavigationValue(variable.href, 'zh-TW')).toBe('/zh-tw/fonts/variable-fonts')
  })

  it('ships exactly the final 149 Approved families in curation order', () => {
    expect(fontCatalog).toHaveLength(149)
    expect(fontCatalog[0]?.family).toBe('Noto Sans TC')
    expect(fontCatalog.some((font) => font.family === 'Roboto Condensed')).toBe(false)
    expect(fontCatalog.map((font) => font.curationRank)).toEqual(
      [...fontCatalog].map((font) => font.curationRank).sort((left, right) => left - right),
    )
  })

  it('supports the public sort and language semantics', () => {
    const popular = filterAndSortFonts(fontCatalog, { sort: 'popular' })
    expect(popular[0]?.officialPopularityRank).toBe(
      Math.min(...fontCatalog.map((font) => font.officialPopularityRank)),
    )
    const alphabetical = filterAndSortFonts(fontCatalog, { sort: 'alphabetical' })
    expect(
      alphabetical.every((font, index) => {
        const previous = alphabetical[index - 1]
        return !previous || previous.family.localeCompare(font.family) <= 0
      }),
    ).toBe(true)
    expect(filterAndSortFonts(fontCatalog, { language: 'Chinese' })).not.toHaveLength(0)
    const latinOnly = filterAndSortFonts(fontCatalog, { language: 'Latin' })
    expect(latinOnly.every((font) => fontLanguages(font).includes('Latin'))).toBe(true)
  })

  it('publishes only English home and directory routes', () => {
    const paths = sitemapPaths()
    expect(supportedLocales).toEqual(['en'])
    expect(hreflangAlternates('fonts')).toEqual([])
    expect(paths).toEqual(expect.arrayContaining(['/', '/fonts']))
    expect(paths.some((path) => path === '/zh' || path.startsWith('/zh/'))).toBe(false)
    expect(paths.some((path) => path === '/zh-tw' || path.startsWith('/zh-tw/'))).toBe(false)
    expect(paths).toEqual(expect.arrayContaining(fontSitemapPaths()))
  })
})

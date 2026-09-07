import { describe, expect, it } from 'vitest'
import { hreflangAlternates, sitemapPaths } from '@/i18n/routes'
import { filterAndSortFonts, fontCatalog, fontLanguages } from '@/lib/font-catalog'
import { validateLegalProfile } from '@/lib/legal'
import { productConfig, validateProductConfig } from '@/lib/product-config'
import { validateSeoFirstProductState } from '@/lib/seo-first-validation'
import { siteNavigation, validateToolSiteNavigation } from '@/lib/site-navigation'
import { legalProfile } from '@/modules/legal-profile'
import { toolRegistry } from '@/modules/tool-registry'

describe('FontOdyssey configuration', () => {
  it('uses the real product identity and Tool mode', () => {
    expect(productConfig.mode).toBe('tool')
    expect(productConfig.brand.name).toBe('FontOdyssey')
    expect(validateProductConfig(productConfig)).toEqual([])
    expect(validateSeoFirstProductState()).toEqual([])
  })

  it('keeps navigation and legal configuration valid', () => {
    expect(validateToolSiteNavigation(siteNavigation, toolRegistry)).toEqual([])
    expect(validateLegalProfile(legalProfile)).toEqual([])
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

  it('publishes reciprocal home and directory routes', () => {
    expect(hreflangAlternates('fonts')).toEqual([
      { locale: 'en', path: '/fonts' },
      { locale: 'zh-CN', path: '/zh/fonts' },
      { locale: 'x-default', path: '/fonts' },
    ])
    expect(sitemapPaths()).toEqual(expect.arrayContaining(['/', '/zh', '/fonts', '/zh/fonts']))
  })
})

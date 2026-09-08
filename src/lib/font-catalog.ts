import catalog from '@/data/font-catalog.json'
import type { FontApprovalFacts } from './font-publishing'

export type FontCategory = 'Sans Serif' | 'Serif' | 'Display' | 'Handwriting' | 'Monospace'
export type FontLanguage = 'Chinese' | 'Japanese' | 'Korean' | 'Latin'
export type FontSort = 'featured' | 'popular' | 'alphabetical' | 'styles'

export type FontCatalogItem = FontApprovalFacts

export const fontCatalog = catalog.fonts as FontCatalogItem[]

const fontBySlug = new Map(fontCatalog.map((font) => [font.slug, font]))

export function findFontBySlug(slug: string): FontCatalogItem | undefined {
  return fontBySlug.get(slug)
}

export function fontLanguages(font: FontCatalogItem): FontLanguage[] {
  const values: FontLanguage[] = []
  if (font.subsets.some((subset) => subset.startsWith('chinese-'))) values.push('Chinese')
  if (font.subsets.includes('japanese')) values.push('Japanese')
  if (font.subsets.includes('korean')) values.push('Korean')
  if (
    font.subsets.includes('latin') &&
    !font.subsets.some(
      (subset) => subset.startsWith('chinese-') || subset === 'japanese' || subset === 'korean',
    )
  ) {
    values.push('Latin')
  }
  return values
}

export function fontSupportsSimplifiedChinese(font: FontCatalogItem): boolean {
  return font.subsets.includes('chinese-simplified')
}

export function fontSupportsTraditionalChinese(font: FontCatalogItem): boolean {
  return font.subsets.includes('chinese-traditional')
}

export function filterAndSortFonts(
  fonts: ReadonlyArray<FontCatalogItem>,
  options: { query?: string; category?: string; language?: string; sort?: FontSort },
): FontCatalogItem[] {
  const query = options.query?.trim().toLocaleLowerCase() ?? ''
  const filtered = fonts.filter(
    (font) =>
      (!query || font.family.toLocaleLowerCase().includes(query)) &&
      (!options.category || options.category === 'All' || font.category === options.category) &&
      (!options.language ||
        options.language === 'All' ||
        fontLanguages(font).includes(options.language as FontLanguage)),
  )

  return [...filtered].sort((left, right) => {
    if (options.sort === 'popular') {
      return left.officialPopularityRank - right.officialPopularityRank
    }
    if (options.sort === 'alphabetical') return left.family.localeCompare(right.family)
    if (options.sort === 'styles') return right.styleCount - left.styleCount
    return left.curationRank - right.curationRank
  })
}

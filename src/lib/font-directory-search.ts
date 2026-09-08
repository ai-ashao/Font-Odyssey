import type { FontCategory, FontLanguage, FontSort } from './font-catalog'

export type FontDirectorySearch = {
  q?: string
  category?: FontCategory
  language?: FontLanguage
  sort?: FontSort
}

const categories = new Set<FontCategory>([
  'Sans Serif',
  'Serif',
  'Display',
  'Handwriting',
  'Monospace',
])
const languages = new Set<FontLanguage>(['Latin', 'Chinese', 'Japanese', 'Korean'])
const sorts = new Set<FontSort>(['featured', 'popular', 'alphabetical', 'styles'])

export function parseFontDirectorySearch(input: Record<string, unknown>): FontDirectorySearch {
  const q = typeof input.q === 'string' ? input.q.trim().slice(0, 100) : ''
  const category = typeof input.category === 'string' ? input.category : ''
  const language = typeof input.language === 'string' ? input.language : ''
  const sort = typeof input.sort === 'string' ? input.sort : ''

  return {
    ...(q ? { q } : {}),
    ...(categories.has(category as FontCategory) ? { category: category as FontCategory } : {}),
    ...(languages.has(language as FontLanguage) ? { language: language as FontLanguage } : {}),
    ...(sorts.has(sort as FontSort) && sort !== 'featured' ? { sort: sort as FontSort } : {}),
  }
}

export function hasActiveFontDirectorySearch(search: FontDirectorySearch): boolean {
  return Boolean(search.q || search.category || search.language || search.sort)
}

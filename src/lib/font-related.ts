import { type FontCatalogItem, fontCatalog, fontLanguages } from './font-catalog'

export type RelatedFontHubId =
  | 'chinese'
  | 'japanese'
  | 'korean'
  | 'latin'
  | 'sans-serif'
  | 'serif'
  | 'display'
  | 'handwriting'
  | 'monospace'
  | 'free-commercial'
  | 'variable-fonts'

const categoryHub: Record<FontCatalogItem['category'], RelatedFontHubId> = {
  'Sans Serif': 'sans-serif',
  Serif: 'serif',
  Display: 'display',
  Handwriting: 'handwriting',
  Monospace: 'monospace',
}

const languageHub = {
  Chinese: 'chinese',
  Japanese: 'japanese',
  Korean: 'korean',
  Latin: 'latin',
} as const

function relationScore(source: FontCatalogItem, candidate: FontCatalogItem): number {
  let score = 0
  if (source.category === candidate.category) score += 60

  const sourceLanguages = new Set(fontLanguages(source))
  const sharedLanguages = fontLanguages(candidate).filter((language) =>
    sourceLanguages.has(language),
  )
  score += sharedLanguages.length * 30

  if (source.variableAxisCount > 0 === candidate.variableAxisCount > 0) score += 8

  const styleDistance = Math.abs(source.styleCount - candidate.styleCount)
  score += Math.max(0, 10 - Math.min(10, styleDistance))

  const popularityDistance = Math.abs(
    source.officialPopularityRank - candidate.officialPopularityRank,
  )
  score += Math.max(0, 8 - Math.min(8, Math.floor(popularityDistance / 25)))

  return score
}

export function relatedFontsFor(font: FontCatalogItem, limit = 4): FontCatalogItem[] {
  if (!Number.isInteger(limit) || limit < 0) return []

  return fontCatalog
    .filter((candidate) => candidate.slug !== font.slug)
    .map((candidate) => ({ candidate, score: relationScore(font, candidate) }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.curationRank - right.candidate.curationRank ||
        left.candidate.family.localeCompare(right.candidate.family),
    )
    .slice(0, limit)
    .map(({ candidate }) => candidate)
}

export function relatedHubIdsFor(font: FontCatalogItem): RelatedFontHubId[] {
  const hubs: RelatedFontHubId[] = [categoryHub[font.category]]
  const primaryLanguage = fontLanguages(font)[0]
  if (primaryLanguage) hubs.push(languageHub[primaryLanguage])
  hubs.push('free-commercial')
  if (font.variableAxisCount > 0) hubs.push('variable-fonts')
  return [...new Set(hubs)]
}

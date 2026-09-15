import type { ToolSeoBrief } from '@/lib/tool-seo-brief'

/**
 * SEO handoff from the user-approved FontOdyssey information architecture.
 * It records no unsupported volume, difficulty, or ranking claims.
 */
export const toolSeoBrief: ToolSeoBrief = {
  status: 'ready',
  primaryKeyword: 'free fonts',
  searchIntent: 'download',
  primaryPage: '/',
  supportingKeywords: [
    'free fonts for commercial use',
    'font download',
    'popular fonts',
    'multilingual fonts',
    'Chinese fonts',
  ],
  firstBatchPages: [
    { keyword: 'free fonts', path: '/', pageType: 'tool', locale: 'en' },
    { keyword: 'font directory', path: '/fonts', pageType: 'category', locale: 'en' },
    { keyword: 'free Chinese fonts', path: '/fonts/chinese', pageType: 'category', locale: 'en' },
    {
      keyword: 'free fonts for commercial use',
      path: '/fonts/free-commercial',
      pageType: 'category',
      locale: 'en',
    },
  ],
  locales: ['en'],
  evidence: [
    {
      source: 'user-approved FontOdyssey SEO-first product brief and market research',
      note: 'The current launch scope is an English-only curated font catalog with font-entity pages, language/category hubs, and source/license checks. No search-volume or keyword-difficulty value is invented here.',
    },
  ],
}

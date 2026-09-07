import type { ToolSeoBrief } from '@/lib/tool-seo-brief'

/**
 * Initial SEO handoff from the user-approved FontOdyssey information architecture.
 * It records no unsupported volume, difficulty, or ranking claims.
 */
export const toolSeoBrief: ToolSeoBrief = {
  status: 'ready',
  primaryKeyword: 'font download',
  localizedPrimaryKeywords: {
    'zh-CN': '字体下载',
  },
  searchIntent: 'download',
  primaryPage: '/',
  supportingKeywords: ['free fonts', 'popular fonts', 'multilingual fonts'],
  firstBatchPages: [
    { keyword: 'font download', path: '/', pageType: 'tool', locale: 'en' },
    { keyword: 'font directory', path: '/fonts', pageType: 'category', locale: 'en' },
    { keyword: '字体下载', path: '/zh', pageType: 'tool', locale: 'zh-CN' },
    { keyword: '字体大全', path: '/zh/fonts', pageType: 'category', locale: 'zh-CN' },
  ],
  locales: ['en', 'zh-CN'],
  evidence: [
    {
      source: 'user-supplied FontOdyssey product and curation brief',
      note: 'The user selected a curated 150-font catalog, default curation ranking, language/category filters, and dedicated font discovery routes. No search-volume or keyword-difficulty claim is made.',
    },
  ],
}

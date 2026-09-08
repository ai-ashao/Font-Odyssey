import type { ToolSeoBrief } from '@/lib/tool-seo-brief'

/**
 * SEO handoff from the user-approved FontOdyssey information architecture.
 * It records no unsupported volume, difficulty, or ranking claims.
 */
export const toolSeoBrief: ToolSeoBrief = {
  status: 'ready',
  primaryKeyword: 'free fonts',
  localizedPrimaryKeywords: {
    'zh-CN': '免费字体下载',
    'zh-TW': '免費字體下載',
  },
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
    { keyword: '免费字体下载', path: '/zh', pageType: 'tool', locale: 'zh-CN' },
    { keyword: '字体大全', path: '/zh/fonts', pageType: 'category', locale: 'zh-CN' },
    { keyword: '免费中文字体', path: '/zh/fonts/chinese', pageType: 'category', locale: 'zh-CN' },
    { keyword: '免費字體下載', path: '/zh-tw', pageType: 'tool', locale: 'zh-TW' },
    {
      keyword: '免費中文字體',
      path: '/zh-tw/fonts/chinese',
      pageType: 'category',
      locale: 'zh-TW',
    },
  ],
  locales: ['en', 'zh-CN', 'zh-TW'],
  evidence: [
    {
      source: 'user-approved FontOdyssey SEO-first product brief and market research',
      note: 'The user approved an EN + zh-CN + zh-TW curated font catalog, font-entity SEO pages, language/category hubs, source/license checks, and market-specific downloads. No search-volume or keyword-difficulty value is invented here.',
    },
  ],
}

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/config'
import {
  type FontCategory,
  type FontLanguage,
  type FontSort,
  filterAndSortFonts,
  fontCatalog,
} from '@/lib/font-catalog'
import type { FontDirectorySearch } from '@/lib/font-directory-search'
import { FontCard } from './font-card'

const categories: Array<'All' | FontCategory> = [
  'All',
  'Sans Serif',
  'Serif',
  'Display',
  'Handwriting',
  'Monospace',
]
const languages: Array<'All' | FontLanguage> = ['All', 'Latin', 'Chinese', 'Japanese', 'Korean']

export function FontCatalogPage({
  locale,
  search = {},
  onSearchChange,
}: Readonly<{
  locale: Locale
  search?: FontDirectorySearch
  onSearchChange?: (search: FontDirectorySearch) => void
}>) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => setHydrated(true), [])

  const query = search.q ?? ''
  const category = search.category ?? 'All'
  const language = search.language ?? 'All'
  const sort = search.sort ?? 'featured'
  const fonts = useMemo(
    () => filterAndSortFonts(fontCatalog, { query, category, language, sort }),
    [query, category, language, sort],
  )

  const copy =
    locale === 'zh-CN'
      ? {
          eyebrow: '精选字体目录',
          title: '浏览 149 个经过许可门禁的字体',
          description:
            '按推荐度、热门程度、类别和语言快速筛选。筛选只服务发现体验，真正需要排名的主题使用独立 Hub 页面。',
          search: '搜索字体',
          results: '个字体',
          category: '类别',
          language: '语言',
          sort: '排序',
        }
      : locale === 'zh-TW'
        ? {
            eyebrow: '精選字體目錄',
            title: '瀏覽 149 個通過授權門檻的字體',
            description:
              '依推薦度、熱門程度、類別與語言快速篩選。篩選只服務探索體驗，需要排名的主題使用獨立 Hub 頁面。',
            search: '搜尋字體',
            results: '個字體',
            category: '類別',
            language: '語言',
            sort: '排序',
          }
        : {
            eyebrow: 'CURATED FONT DIRECTORY',
            title: 'Explore 149 license-gated font families',
            description:
              'Filter by recommendation, popularity, category, and language. Filters support discovery; indexable search themes live on dedicated hub pages.',
            search: 'Search fonts',
            results: 'fonts',
            category: 'Category',
            language: 'Language',
            sort: 'Sort',
          }

  return (
    <section
      className="mx-auto max-w-[1180px] px-5 py-12 sm:px-6 sm:py-16"
      data-font-directory
      data-hydrated={hydrated}
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {copy.description}
        </p>
      </header>

      <div className="mt-10 grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-[minmax(220px,1fr)_repeat(3,auto)]">
        <input
          aria-label={copy.search}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onInput={(event) =>
            onSearchChange?.({
              ...search,
              q: event.currentTarget.value.trim() || undefined,
            })
          }
          placeholder={`${copy.search}…`}
          type="search"
          value={query}
        />
        <select
          aria-label={copy.category}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => {
            const value = event.target.value as (typeof categories)[number]
            onSearchChange?.({ ...search, category: value === 'All' ? undefined : value })
          }}
          value={category}
        >
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label={copy.language}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => {
            const value = event.target.value as (typeof languages)[number]
            onSearchChange?.({ ...search, language: value === 'All' ? undefined : value })
          }}
          value={language}
        >
          {languages.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label={copy.sort}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => {
            const value = event.target.value as FontSort
            onSearchChange?.({ ...search, sort: value === 'featured' ? undefined : value })
          }}
          value={sort}
        >
          <option value="featured">Featured</option>
          <option value="popular">Most Popular</option>
          <option value="alphabetical">A–Z</option>
          <option value="styles">Most Styles</option>
        </select>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted-foreground">
        {fonts.length} {copy.results}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fonts.map((font) => (
          <FontCard font={font} key={font.slug} locale={locale} />
        ))}
      </div>
    </section>
  )
}

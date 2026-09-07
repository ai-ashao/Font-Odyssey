import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/i18n/config'
import {
  type FontCategory,
  type FontLanguage,
  type FontSort,
  filterAndSortFonts,
  fontCatalog,
} from '@/lib/font-catalog'
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

export function FontCatalogPage({ locale }: Readonly<{ locale: Locale }>) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [language, setLanguage] = useState<(typeof languages)[number]>('All')
  const [sort, setSort] = useState<FontSort>('featured')
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const fonts = useMemo(
    () => filterAndSortFonts(fontCatalog, { query, category, language, sort }),
    [query, category, language, sort],
  )
  const copy =
    locale === 'zh-CN'
      ? {
          eyebrow: '精选字体目录',
          title: '探索 149 个经过许可门禁的字体',
          description:
            '按推荐度、热门程度、类别和语言快速筛选。默认顺序来自 FontOdyssey 的策展排名。',
          search: '搜索字体',
          results: '个字体',
        }
      : {
          eyebrow: 'CURATED FONT DIRECTORY',
          title: 'Explore 149 license-gated font families',
          description:
            'Filter by recommendation, popularity, category, and language. Featured order follows the FontOdyssey curation rank.',
          search: 'Search fonts',
          results: 'fonts',
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
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder={`${copy.search}…`}
          type="search"
          value={query}
        />
        <select
          aria-label="Category"
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}
          value={category}
        >
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label="Language"
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => setLanguage(event.target.value as (typeof languages)[number])}
          value={language}
        >
          {languages.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          aria-label="Sort"
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          onChange={(event) => setSort(event.target.value as FontSort)}
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

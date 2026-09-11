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
const categoryLabels = {
  All: ['All styles', '全部类别', '全部類別'],
  'Sans Serif': ['Sans Serif', '无衬线', '無襯線'],
  Serif: ['Serif', '衬线', '襯線'],
  Display: ['Display', '展示字体', '展示字體'],
  Handwriting: ['Handwriting', '手写体', '手寫體'],
  Monospace: ['Monospace', '等宽', '等寬'],
} as const
const languageLabels = {
  All: ['All languages', '全部语言', '全部語言'],
  Latin: ['Latin', '拉丁文', '拉丁文'],
  Chinese: ['Chinese', '中文', '中文'],
  Japanese: ['Japanese', '日文', '日文'],
  Korean: ['Korean', '韩文', '韓文'],
} as const
const sortLabels = {
  featured: ['Featured', '精选推荐', '精選推薦'],
  popular: ['Most Popular', '热门优先', '熱門優先'],
  alphabetical: ['A–Z', '名称 A–Z', '名稱 A–Z'],
  styles: ['Most Styles', '样式最多', '樣式最多'],
} as const

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
  const [draft, setDraft] = useState(search.q ?? '')
  const [composing, setComposing] = useState(false)
  const [previewText, setPreviewText] = useState<string>()
  const index = locale === 'en' ? 0 : locale === 'zh-CN' ? 1 : 2
  const category = search.category ?? 'All'
  const language = search.language ?? 'All'
  const sort = search.sort ?? 'featured'
  const directory = locale === 'en' ? '/fonts' : locale === 'zh-CN' ? '/zh/fonts' : '/zh-tw/fonts'
  useEffect(() => setHydrated(true), [])
  useEffect(() => setDraft(search.q ?? ''), [search.q])
  useEffect(() => {
    if (composing || !onSearchChange || draft.trim() === (search.q ?? '')) return
    const timer = setTimeout(() => onSearchChange({ ...search, q: draft.trim() || undefined }), 260)
    return () => clearTimeout(timer)
  }, [draft, composing, onSearchChange, search])
  const fonts = useMemo(
    () =>
      filterAndSortFonts(fontCatalog, {
        query: composing ? (search.q ?? '') : draft.trim(),
        category,
        language,
        sort,
      }),
    [draft, composing, search.q, category, language, sort],
  )
  const copy = {
    eyebrow: ['CURATED FONT DIRECTORY', '精选字体目录', '精選字體目錄'][index],
    title: [
      'Explore 149 license-gated font families',
      '浏览 149 个经过许可门禁的字体',
      '瀏覽 149 個通過授權門檻的字體',
    ][index],
    description: [
      'Find a font by name, style or language. Compare the available previews and open a family for its files and license.',
      '按名称、风格或语言找字体，比较可用样张，再查看字体文件和授权信息。',
      '依名稱、風格或語言找字體，比較可用樣張，再查看字體檔案與授權資訊。',
    ][index],
    search: ['Search fonts', '搜索字体', '搜尋字體'][index],
    category: ['Category', '类别', '類別'][index],
    language: ['Language', '语言', '語言'][index],
    sort: ['Sort', '排序', '排序'][index],
    results: ['fonts', '个字体', '個字體'][index],
    reset: ['Clear filters', '清除筛选', '清除篩選'][index],
    sample: ['Compare with your text', '用自己的文字比较', '用自己的文字比較'][index],
    samplePlaceholder: [
      'Automatic sample for each font',
      '默认显示各字体适用的样张',
      '預設顯示各字體適用的樣張',
    ][index],
    resetSample: ['Reset samples', '恢复默认样张', '恢復預設樣張'][index],
    noResults: ['No fonts match these filters', '没有符合当前条件的字体', '沒有符合目前條件的字體'][
      index
    ],
    emptyHint: [
      'Try fewer words or clear a style or language filter.',
      '试试减少关键词，或清除类别、语言筛选。',
      '試試減少關鍵字，或清除類別、語言篩選。',
    ][index],
    subset: [
      'Previews use small subsets. Missing characters are marked; downloads contain the original files.',
      '预览仅使用小型子集，缺少的字符会明确提示；下载提供原始字体文件。',
      '預覽只使用小型子集，缺少的字元會清楚提示；下載提供原始字體檔案。',
    ][index],
  }
  const active = Boolean(draft || search.category || search.language || search.sort)
  return (
    <section className="fo-directory" data-font-directory data-hydrated={hydrated}>
      <header>
        <p className="prototype-eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>
      <form
        className="fo-directory-filters"
        action={directory}
        onSubmit={
          onSearchChange
            ? (event) => {
                event.preventDefault()
                if (!composing) onSearchChange({ ...search, q: draft.trim() || undefined })
              }
            : undefined
        }
      >
        <label>
          {copy.search}
          <input
            name="q"
            aria-label={copy.search}
            type="search"
            maxLength={100}
            placeholder={`${copy.search}…`}
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
        </label>
        <label>
          {copy.category}
          <select
            name="category"
            aria-label={copy.category}
            value={onSearchChange ? category : undefined}
            defaultValue={onSearchChange ? undefined : category}
            onChange={(event) =>
              onSearchChange?.({
                ...search,
                q: draft.trim() || undefined,
                category:
                  event.currentTarget.value === 'All'
                    ? undefined
                    : (event.currentTarget.value as FontCategory),
              })
            }
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value][index]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {copy.language}
          <select
            name="language"
            aria-label={copy.language}
            value={onSearchChange ? language : undefined}
            defaultValue={onSearchChange ? undefined : language}
            onChange={(event) =>
              onSearchChange?.({
                ...search,
                q: draft.trim() || undefined,
                language:
                  event.currentTarget.value === 'All'
                    ? undefined
                    : (event.currentTarget.value as FontLanguage),
              })
            }
          >
            {languages.map((value) => (
              <option key={value} value={value}>
                {languageLabels[value][index]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {copy.sort}
          <select
            name="sort"
            aria-label={copy.sort}
            value={onSearchChange ? sort : undefined}
            defaultValue={onSearchChange ? undefined : sort}
            onChange={(event) =>
              onSearchChange?.({
                ...search,
                q: draft.trim() || undefined,
                sort:
                  event.currentTarget.value === 'featured'
                    ? undefined
                    : (event.currentTarget.value as FontSort),
              })
            }
          >
            {(Object.keys(sortLabels) as FontSort[]).map((value) => (
              <option key={value} value={value}>
                {sortLabels[value][index]}
              </option>
            ))}
          </select>
        </label>
        <button className="fo-primary-button" type="submit">
          {copy.search}
        </button>
      </form>
      <div className="fo-directory-sample">
        <label>
          {copy.sample}
          <input
            aria-label={copy.sample}
            maxLength={140}
            placeholder={copy.samplePlaceholder}
            value={previewText ?? ''}
            onChange={(event) => setPreviewText(event.currentTarget.value)}
          />
        </label>
        <button
          className="fo-secondary-button"
          type="button"
          onClick={() => setPreviewText(undefined)}
        >
          {copy.resetSample}
        </button>
      </div>
      <div className="fo-directory-results">
        <p aria-live="polite">
          {fonts.length} {copy.results}
        </p>
        {active ? (
          <a
            href={directory}
            onClick={
              onSearchChange
                ? (event) => {
                    event.preventDefault()
                    setDraft('')
                    onSearchChange({})
                  }
                : undefined
            }
          >
            {copy.reset}
          </a>
        ) : null}
      </div>
      <p className="fo-preview-footnote">{copy.subset}</p>
      {fonts.length ? (
        <div className="fo-directory-grid">
          {fonts.map((font) => (
            <FontCard font={font} key={font.slug} locale={locale} previewText={previewText} />
          ))}
        </div>
      ) : (
        <div className="fo-directory-empty">
          <h2>{copy.noResults}</h2>
          <p>{copy.emptyHint}</p>
          <a className="fo-secondary-button" href={directory}>
            {copy.reset}
          </a>
        </div>
      )}
    </section>
  )
}

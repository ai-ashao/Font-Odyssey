import type { Locale } from '@/i18n/config'
import { type FontCatalogItem, fontLanguages } from '@/lib/font-catalog'
import { fontPath } from '@/lib/font-routes'
import { FontCardPreview } from './font-preview'

const categories = {
  'Sans Serif': ['Sans Serif', '无衬线', '無襯線'],
  Serif: ['Serif', '衬线', '襯線'],
  Display: ['Display', '展示字体', '展示字體'],
  Handwriting: ['Handwriting', '手写体', '手寫體'],
  Monospace: ['Monospace', '等宽', '等寬'],
} as const
const languages = {
  Latin: ['Latin', '拉丁文', '拉丁文'],
  Chinese: ['Chinese', '中文', '中文'],
  Japanese: ['Japanese', '日文', '日文'],
  Korean: ['Korean', '韩文', '韓文'],
} as const

export function FontCard({
  font,
  locale,
  previewText,
}: Readonly<{ font: FontCatalogItem; locale: Locale; previewText?: string }>) {
  const index = locale === 'en' ? 0 : locale === 'zh-CN' ? 1 : 2
  return (
    <article
      className="fo-font-card group relative overflow-hidden rounded-2xl border bg-card p-5"
      data-font-card={font.slug}
    >
      <a
        className="fo-card-link"
        href={fontPath(font, locale)}
        aria-label={`${font.family} ${locale === 'en' ? 'font' : locale === 'zh-CN' ? '字体' : '字體'}`}
      >
        <span className="sr-only">{font.family}</span>
      </a>
      <div className="fo-card-topline">
        <span>#{String(font.curationRank).padStart(3, '0')}</span>
        <span>{categories[font.category][index]}</span>
      </div>
      <h2 className="fo-card-name">{font.family}</h2>
      <FontCardPreview font={font} locale={locale} text={previewText} />
      <div className="fo-card-facts">
        <span>
          {font.styleCount} {index === 0 ? 'styles' : index === 1 ? '种样式' : '種樣式'}
        </span>
        <span>{font.license}</span>
        {font.variableAxisCount > 0 ? (
          <span>{index === 0 ? 'Variable' : index === 1 ? '可变' : '可變'}</span>
        ) : null}
        {fontLanguages(font)
          .slice(0, 2)
          .map((language) => (
            <span key={language}>{languages[language][index]}</span>
          ))}
      </div>
      <div className="fo-card-cta">
        {index === 0 ? 'View font' : index === 1 ? '查看字体' : '查看字體'} →
      </div>
    </article>
  )
}

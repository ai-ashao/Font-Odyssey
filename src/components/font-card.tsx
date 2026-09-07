import type { Locale } from '@/i18n/config'
import { type FontCatalogItem, fontLanguages } from '@/lib/font-catalog'

export function FontCard({ font, locale }: Readonly<{ font: FontCatalogItem; locale: Locale }>) {
  const languages = fontLanguages(font)
  const styles = locale === 'zh-CN' ? `${font.styleCount} 种样式` : `${font.styleCount} styles`
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm" data-font-card={font.slug}>
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] text-muted-foreground">
          #{String(font.curationRank).padStart(3, '0')}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground">
          {font.category}
        </span>
      </div>
      <h2 className="mt-8 text-2xl font-medium tracking-tight">{font.family}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {locale === 'zh-CN'
          ? '字体漫游，发现值得长期使用的字形。'
          : 'The quick brown fox jumps over the lazy dog.'}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{styles}</span>
        <span aria-hidden="true">·</span>
        <span>{font.license}</span>
        {languages.map((language) => (
          <span className="rounded-full border px-2 py-0.5" key={language}>
            {language}
          </span>
        ))}
      </div>
    </article>
  )
}

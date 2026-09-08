import type { CSSProperties } from 'react'
import type { Locale } from '@/i18n/config'
import { fontPreviewUrl } from '@/lib/font-assets'
import { type FontCatalogItem, fontLanguages } from '@/lib/font-catalog'
import { fontPath } from '@/lib/font-routes'

export function FontCard({
  font,
  locale,
  previewText,
}: Readonly<{ font: FontCatalogItem; locale: Locale; previewText?: string }>) {
  const languages = fontLanguages(font)
  const styles =
    locale === 'zh-CN'
      ? `${font.styleCount} 种样式`
      : locale === 'zh-TW'
        ? `${font.styleCount} 種樣式`
        : `${font.styleCount} styles`
  const preview =
    previewText ||
    (locale === 'zh-CN'
      ? '让文字拥有自己的声音。'
      : locale === 'zh-TW'
        ? '讓文字擁有自己的聲音。'
        : 'Make something worth reading.')
  const previewUrl = fontPreviewUrl(font)
  const familyName = `FontOdysseyPreview-${font.slug}`
  const previewStyle: CSSProperties | undefined = previewUrl
    ? { fontFamily: `"${familyName}", var(--sans)` }
    : undefined

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30"
      data-font-card={font.slug}
    >
      {previewUrl ? (
        <style>{`@font-face{font-family:"${familyName}";src:url("${previewUrl}") format("woff2");font-display:swap;}`}</style>
      ) : null}
      <a
        aria-label={`${font.family} font`}
        className="absolute inset-0 z-10 rounded-2xl"
        href={fontPath(font, locale)}
      >
        <span className="sr-only">{font.family}</span>
      </a>
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-[10px] text-muted-foreground">
          #{String(font.curationRank).padStart(3, '0')}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground">
          {font.category}
        </span>
      </div>
      <h2 className="mt-7 text-xl font-semibold tracking-[-0.03em]">{font.family}</h2>
      <p
        className="mt-5 min-h-16 break-words text-[1.55rem] leading-tight tracking-[-0.035em]"
        style={previewStyle}
      >
        {preview}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <span>{styles}</span>
        <span aria-hidden="true">·</span>
        <span>{font.license}</span>
        {font.variableAxisCount > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span>Variable</span>
          </>
        ) : null}
        {languages.slice(0, 2).map((language) => (
          <span className="rounded-full border px-2 py-0.5" key={language}>
            {language}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm font-semibold text-primary">
        {locale === 'zh-CN' ? '查看字体' : locale === 'zh-TW' ? '查看字體' : 'View font'} →
      </div>
    </article>
  )
}

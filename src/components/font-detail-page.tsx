import { ArrowLeft, Download, ShieldCheck } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { fontDownloadSources, fontPreviewUrl } from '@/lib/font-assets'
import {
  type FontCatalogItem,
  fontLanguages,
  fontSupportsSimplifiedChinese,
  fontSupportsTraditionalChinese,
} from '@/lib/font-catalog'
import type { PublishedFont } from '@/lib/font-publishing'
import { findFontHub, fontHubPath } from '@/lib/font-routes'

export function FontDetailPage({
  font,
  locale,
}: Readonly<{ font: FontCatalogItem | PublishedFont | undefined; locale: Locale }>) {
  if (font && 'facts' in font) return <PublishedFontDetailPage font={font} locale={locale} />
  return <CatalogFontDetailPage font={font} locale={locale} />
}

function CatalogFontDetailPage({
  font,
  locale,
}: Readonly<{ font: FontCatalogItem | undefined; locale: Locale }>) {
  const [previewText, setPreviewText] = useState(
    locale === 'zh-CN'
      ? '让文字拥有自己的声音。'
      : locale === 'zh-TW'
        ? '讓文字擁有自己的聲音。'
        : 'Make something worth reading.',
  )

  if (!font) return <MissingFont locale={locale} />

  const copy =
    locale === 'zh-CN'
      ? {
          back: '全部字体',
          preview: '在线预览',
          previewHint: '输入自己的文字测试该字体。真实预览文件会在 R2 资源配置后自动加载。',
          details: '字体信息',
          styles: '样式',
          axes: '可变轴',
          license: '许可证',
          languages: '语言支持',
          source: '来源与下载',
          sourceCopy: '下载入口只在真实链接已经配置时显示；否则回退到官方来源。',
          related: '相关字体',
        }
      : locale === 'zh-TW'
        ? {
            back: '全部字體',
            preview: '線上預覽',
            previewHint: '輸入自己的文字測試該字體。真實預覽檔會在 R2 資源設定後自動載入。',
            details: '字體資訊',
            styles: '樣式',
            axes: '可變軸',
            license: '授權',
            languages: '語言支援',
            source: '來源與下載',
            sourceCopy: '下載入口只在真實連結已設定時顯示；否則回退到官方來源。',
            related: '相關字體',
          }
        : {
            back: 'All fonts',
            preview: 'Live preview',
            previewHint:
              'Type your own text. The real font face loads automatically after its R2 preview asset is configured.',
            details: 'Font details',
            styles: 'Styles',
            axes: 'Variable axes',
            license: 'License',
            languages: 'Language support',
            source: 'Source & download',
            sourceCopy:
              'Download providers only appear when real URLs are configured; otherwise the page falls back to the official upstream source.',
            related: 'Related fonts',
          }

  const previewUrl = fontPreviewUrl(font)
  const familyName = `FontOdysseyDetail-${font.slug}`
  const downloads = fontDownloadSources(font, locale)
  const languages = fontLanguages(font)
  const relatedHub = findFontHub(
    languages.includes('Chinese')
      ? 'chinese'
      : languages.includes('Japanese')
        ? 'japanese'
        : languages.includes('Korean')
          ? 'korean'
          : 'latin',
  )
  return (
    <article
      className="mx-auto max-w-[1080px] px-5 py-10 sm:px-6 sm:py-14"
      data-font-detail={font.slug}
    >
      {previewUrl ? (
        <style>{`@font-face{font-family:"${familyName}";src:url("${previewUrl}") format("woff2");font-display:swap;}`}</style>
      ) : null}
      <a
        className="text-sm font-semibold text-primary"
        href={locale === 'en' ? '/fonts' : locale === 'zh-CN' ? '/zh/fonts' : '/zh-tw/fonts'}
      >
        ← {copy.back}
      </a>

      <header className="mt-8 grid gap-7 border-b pb-9 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">
            #{String(font.curationRank).padStart(3, '0')} · {font.category}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.055em] sm:text-6xl">
            {font.family} Font
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            {locale === 'en'
              ? `${font.family} is a curated ${font.category.toLowerCase()} family with ${font.styleCount} styles. Review its license, language support, and upstream source before downloading.`
              : locale === 'zh-CN'
                ? `${font.family} 是 FontOdyssey 精选的${font.category}字体家族，共 ${font.styleCount} 种样式。下载前可查看许可证、语言支持与上游来源。`
                : `${font.family} 是 FontOdyssey 精選的 ${font.category} 字體家族，共 ${font.styleCount} 種樣式。下載前可查看授權、語言支援與上游來源。`}
          </p>
        </div>
        <span className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
          {font.license}
        </span>
      </header>

      <section className="py-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{copy.preview}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.previewHint}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {previewUrl ? 'WOFF2 preview' : 'Preview asset pending'}
          </span>
        </div>
        <textarea
          aria-label={copy.preview}
          className="mt-5 min-h-40 w-full resize-y rounded-2xl border bg-card p-5 text-4xl leading-tight tracking-[-0.04em] outline-none sm:text-5xl"
          maxLength={140}
          onChange={(event) => setPreviewText(event.currentTarget.value)}
          style={previewUrl ? { fontFamily: `"${familyName}", var(--sans)` } : undefined}
          value={previewText}
        />
      </section>

      <div className="grid gap-4 border-y py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label={copy.styles} value={String(font.styleCount)} />
        <Meta label={copy.axes} value={String(font.variableAxisCount)} />
        <Meta label={copy.license} value={font.license} />
        <Meta label="Popularity rank" value={`#${font.officialPopularityRank}`} />
      </div>

      <section className="grid gap-8 py-10 md:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{copy.languages}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {locale === 'en'
              ? 'Support below comes from the current launch catalog metadata. Exact glyph coverage can be added later from the ingestion analysis.'
              : locale === 'zh-CN'
                ? '以下支持信息来自当前首发目录 metadata；后续可以继续接入 ingestion 分析得到的精确字符覆盖率。'
                : '以下支援資訊來自目前首發目錄 metadata；後續可以繼續接入 ingestion 分析得到的精確字元覆蓋率。'}
          </p>
        </div>
        <div className="flex flex-wrap content-start gap-2">
          {languages.map((language) => (
            <span className="rounded-full border bg-card px-3 py-2 text-sm" key={language}>
              {language}
            </span>
          ))}
          {fontSupportsSimplifiedChinese(font) ? (
            <span className="rounded-full border bg-card px-3 py-2 text-sm">
              Simplified Chinese
            </span>
          ) : null}
          {fontSupportsTraditionalChinese(font) ? (
            <span className="rounded-full border bg-card px-3 py-2 text-sm">
              Traditional Chinese
            </span>
          ) : null}
          {font.subsets.includes('latin-ext') ? (
            <span className="rounded-full border bg-card px-3 py-2 text-sm">Latin Extended</span>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-2xl font-semibold tracking-tight">{copy.source}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{copy.sourceCopy}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {downloads.map((source) => (
            <a
              className={
                source.primary
                  ? 'inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground'
                  : 'inline-flex min-h-11 items-center rounded-xl border px-5 text-sm font-semibold'
              }
              href={source.url}
              key={source.id}
              rel={source.sponsored ? 'sponsored nofollow noopener' : 'noopener'}
              target="_blank"
            >
              {source.label}
            </a>
          ))}
        </div>
      </section>

      {relatedHub ? (
        <section className="mt-10 border-t pt-9">
          <h2 className="text-xl font-semibold">{copy.related}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === 'en'
              ? 'Continue through the relevant language collection.'
              : locale === 'zh-CN'
                ? '继续浏览对应的语言字体合集。'
                : '繼續瀏覽對應的語言字體合集。'}
          </p>
          <a
            className="mt-4 inline-flex text-sm font-semibold text-primary"
            href={fontHubPath(relatedHub, locale)}
          >
            {relatedHub.localized[locale].title} →
          </a>
        </section>
      ) : null}
    </article>
  )
}

function Meta({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  )
}

function MissingFont({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-4xl font-semibold">
        {locale === 'en'
          ? 'Font not found'
          : locale === 'zh-CN'
            ? '没有找到这个字体'
            : '找不到這個字體'}
      </h1>
      <a
        className="mt-6 inline-flex text-sm font-semibold text-primary"
        href={locale === 'en' ? '/fonts' : locale === 'zh-CN' ? '/zh/fonts' : '/zh-tw/fonts'}
      >
        {locale === 'en' ? 'Browse fonts' : locale === 'zh-CN' ? '浏览字体' : '瀏覽字體'} →
      </a>
    </section>
  )
}

function PublishedFontDetailPage({
  font,
  locale,
}: Readonly<{ font: PublishedFont; locale: Locale }>) {
  const content = font.content[locale]
  if (!content) return null

  return <PublishedFontDetailContent content={content} font={font} />
}

function PublishedFontDetailContent({
  content,
  font,
}: Readonly<{
  content: NonNullable<PublishedFont['content'][Locale]>
  font: PublishedFont
}>) {
  const [sample, setSample] = useState(content.previewText)
  const [size, setSize] = useState(72)
  const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'error'>(
    font.release.preview ? 'loading' : 'error',
  )
  const previewFace = `FontOdyssey-${font.facts.slug}`
  const previewUrl = font.release.preview?.url
  const rangeId = useId()

  useEffect(() => {
    if (!previewUrl) return
    const face = new FontFace(previewFace, `url(${JSON.stringify(previewUrl)})`, {
      display: 'swap',
    })
    let active = true
    setPreviewState('loading')
    void face
      .load()
      .then((loaded) => {
        if (!active) return
        document.fonts.add(loaded)
        setPreviewState('ready')
      })
      .catch(() => {
        if (active) setPreviewState('error')
      })
    return () => {
      active = false
      document.fonts.delete(face)
    }
  }, [previewFace, previewUrl])

  return (
    <article className="font-detail" data-font-detail={font.facts.slug}>
      <div className="font-detail-inner">
        <a className="font-detail-back" href="/fonts">
          <ArrowLeft aria-hidden="true" /> All fonts
        </a>

        <header className="font-detail-hero">
          <div>
            <p className="font-detail-kicker">
              Curated #{String(font.facts.curationRank).padStart(3, '0')} · {font.facts.category}
            </p>
            <h1 style={{ fontFamily: `${previewFace}, var(--sans)` }}>{content.h1}</h1>
            <p>{content.intro}</p>
          </div>
          <dl className="font-detail-facts">
            <div>
              <dt>Styles</dt>
              <dd>{font.facts.styleCount}</dd>
            </div>
            <div>
              <dt>Axes</dt>
              <dd>{font.facts.axes.length ? font.facts.axes.join(', ') : 'Static'}</dd>
            </div>
            <div>
              <dt>License</dt>
              <dd>{font.facts.license}</dd>
            </div>
          </dl>
        </header>

        <section className="font-specimen" aria-labelledby={`${rangeId}-heading`}>
          <div className="font-specimen-toolbar">
            <div>
              <p className="font-detail-kicker">Live specimen</p>
              <h2 id={`${rangeId}-heading`}>Try it at your size</h2>
              <span
                aria-live="polite"
                className="font-preview-state"
                data-preview-state={previewState}
              >
                {previewState === 'ready'
                  ? 'Preview font ready'
                  : previewState === 'loading'
                    ? 'Loading preview font…'
                    : 'Preview font could not be loaded'}
              </span>
            </div>
            <label htmlFor={rangeId}>
              <span>{size}px</span>
              <input
                id={rangeId}
                max="128"
                min="24"
                onChange={(event) => setSize(Number(event.currentTarget.value))}
                type="range"
                value={size}
              />
            </label>
          </div>
          <textarea
            aria-label={`Preview text for ${font.facts.family}`}
            onChange={(event) => setSample(event.currentTarget.value)}
            spellCheck="false"
            style={{ fontFamily: `${previewFace}, var(--sans)`, fontSize: `${size}px` }}
            value={sample}
          />
        </section>

        <div className="font-detail-columns">
          <section>
            <p className="font-detail-kicker">About the family</p>
            <h2>What it brings to a layout</h2>
            {content.about.map((paragraph) => (
              <p className="font-detail-copy" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
          <section>
            <p className="font-detail-kicker">Works well for</p>
            <ul className="font-use-cases">
              {content.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="font-download-panel">
          <div>
            <p className="font-detail-kicker">Verified release</p>
            <h2>Download {font.facts.family}</h2>
            <p className="font-download-copy">
              Original font files, source notice, and license text. Release{' '}
              {font.release.releaseVersion}.
            </p>
          </div>
          <div className="font-download-actions">
            <a href={font.release.package.url} download>
              <Download aria-hidden="true" /> Download ZIP
            </a>
            <a className="font-license-link" href={font.release.license.url}>
              <ShieldCheck aria-hidden="true" /> Read license
            </a>
          </div>
        </section>
      </div>
    </article>
  )
}

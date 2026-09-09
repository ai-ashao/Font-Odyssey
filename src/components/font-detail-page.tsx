import { ArrowLeft, Download, ShieldCheck } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { fontDownloadSources, fontPreviewUrl } from '@/lib/font-assets'
import { type FontCatalogItem, fontLanguages } from '@/lib/font-catalog'
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
              ? 'Coverage is measured from the analyzed font files, not inferred from the family name.'
              : locale === 'zh-CN'
                ? '覆盖率来自字体文件实测分析，不根据字体名称或标签猜测。'
                : '覆蓋率來自字體檔案實測分析，不依字體名稱或標籤推測。'}
          </p>
        </div>
        <CoveragePanel font={font} locale={locale} />
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

function CoveragePanel({ font, locale }: Readonly<{ font: FontCatalogItem; locale: Locale }>) {
  const labels =
    locale === 'zh-CN'
      ? {
          title: '字符覆盖率',
          latin: '拉丁字符',
          zhCN: '简体中文',
          zhTW: '繁体中文',
          japanese: '日文',
          korean: '韩文',
          glyphs: '最大 Glyph 数',
          codepoints: 'Unicode 码点',
        }
      : locale === 'zh-TW'
        ? {
            title: '字元覆蓋率',
            latin: '拉丁字元',
            zhCN: '簡體中文',
            zhTW: '繁體中文',
            japanese: '日文',
            korean: '韓文',
            glyphs: '最大 Glyph 數',
            codepoints: 'Unicode 碼點',
          }
        : {
            title: 'Character coverage',
            latin: 'Latin',
            zhCN: 'Simplified Chinese',
            zhTW: 'Traditional Chinese',
            japanese: 'Japanese',
            korean: 'Korean',
            glyphs: 'Max glyphs',
            codepoints: 'Unicode codepoints',
          }

  const metrics = [
    ['latin', labels.latin, font.coverage.latin],
    ['zhCN', labels.zhCN, font.coverage.zhCN],
    ['zhTW', labels.zhTW, font.coverage.zhTW],
    ['japanese', labels.japanese, font.coverage.japanese],
    ['korean', labels.korean, font.coverage.korean],
  ] as const
  const visibleMetrics = metrics.filter(([, , value]) => value > 0)

  return (
    <section className="rounded-2xl border bg-card p-5" aria-label={labels.title}>
      <h3 className="text-lg font-semibold">{labels.title}</h3>
      <div className="mt-5 space-y-4">
        {visibleMetrics.map(([key, label, value]) => {
          const percent = Math.round(value * 1000) / 10
          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span>{label}</span>
                <strong>{percent.toFixed(percent === 100 ? 0 : 1)}%</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <dl className="mt-6 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{labels.glyphs}</dt>
          <dd className="mt-1 font-semibold">{font.glyphCountMax.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{labels.codepoints}</dt>
          <dd className="mt-1 font-semibold">{font.unicodeCodepointUnion.toLocaleString()}</dd>
        </div>
      </dl>
    </section>
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

  return <PublishedFontDetailContent content={content} font={font} locale={locale} />
}

function PublishedFontDetailContent({
  content,
  font,
  locale,
}: Readonly<{
  content: NonNullable<PublishedFont['content'][Locale]>
  font: PublishedFont
  locale: Locale
}>) {
  const [sample, setSample] = useState(content.previewText)
  const [size, setSize] = useState(72)
  const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'unavailable' | 'error'>(
    font.release.preview ? 'loading' : 'unavailable',
  )
  const previewFace = `FontOdyssey-${font.facts.slug}`
  const previewUrl = font.release.preview?.url
  const rangeId = useId()
  const copy =
    locale === 'zh-CN'
      ? {
          allFonts: '全部字体',
          curated: '精选',
          styles: '样式',
          axes: '可变轴',
          license: '许可证',
          static: '静态',
          specimen: '在线预览',
          trySize: '按你的字号试用',
          ready: '预览字体已加载',
          loading: '正在加载预览字体…',
          unavailable: '此版本不提供衍生预览',
          failed: '预览字体加载失败',
          previewLabel: '预览文字',
          about: '关于这个字体家族',
          brings: '它能为版面带来什么',
          uses: '适合用途',
          verified: '已验证版本',
          download: '下载',
          downloadCopy: '原始字体文件、来源说明与许可证文本。版本',
          zip: '下载 ZIP',
          readLicense: '阅读许可证',
        }
      : locale === 'zh-TW'
        ? {
            allFonts: '全部字體',
            curated: '精選',
            styles: '樣式',
            axes: '可變軸',
            license: '授權',
            static: '靜態',
            specimen: '線上預覽',
            trySize: '依你的字級試用',
            ready: '預覽字體已載入',
            loading: '正在載入預覽字體…',
            unavailable: '此版本不提供衍生預覽',
            failed: '預覽字體載入失敗',
            previewLabel: '預覽文字',
            about: '關於這個字體家族',
            brings: '它能為版面帶來什麼',
            uses: '適合用途',
            verified: '已驗證版本',
            download: '下載',
            downloadCopy: '原始字體檔、來源說明與授權文字。版本',
            zip: '下載 ZIP',
            readLicense: '閱讀授權',
          }
        : {
            allFonts: 'All fonts',
            curated: 'Curated',
            styles: 'Styles',
            axes: 'Axes',
            license: 'License',
            static: 'Static',
            specimen: 'Live specimen',
            trySize: 'Try it at your size',
            ready: 'Preview font ready',
            loading: 'Loading preview font…',
            unavailable: 'Preview unavailable for this release',
            failed: 'Preview font could not be loaded',
            previewLabel: 'Preview text',
            about: 'About the family',
            brings: 'What it brings to a layout',
            uses: 'Works well for',
            verified: 'Verified release',
            download: 'Download',
            downloadCopy: 'Original font files, source notice, and license text. Release',
            zip: 'Download ZIP',
            readLicense: 'Read license',
          }
  const directoryPath =
    locale === 'en' ? '/fonts' : locale === 'zh-CN' ? '/zh/fonts' : '/zh-tw/fonts'

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
        <a className="font-detail-back" href={directoryPath}>
          <ArrowLeft aria-hidden="true" /> {copy.allFonts}
        </a>

        <header className="font-detail-hero">
          <div>
            <p className="font-detail-kicker">
              {copy.curated} #{String(font.facts.curationRank).padStart(3, '0')} ·{' '}
              {font.facts.category}
            </p>
            <h1 style={{ fontFamily: `${previewFace}, var(--sans)` }}>{content.h1}</h1>
            <p>{content.intro}</p>
          </div>
          <dl className="font-detail-facts">
            <div>
              <dt>{copy.styles}</dt>
              <dd>{font.facts.styleCount}</dd>
            </div>
            <div>
              <dt>{copy.axes}</dt>
              <dd>{font.facts.axes.length ? font.facts.axes.join(', ') : copy.static}</dd>
            </div>
            <div>
              <dt>{copy.license}</dt>
              <dd>{font.facts.license}</dd>
            </div>
          </dl>
        </header>

        <section className="font-specimen" aria-labelledby={`${rangeId}-heading`}>
          <div className="font-specimen-toolbar">
            <div>
              <p className="font-detail-kicker">{copy.specimen}</p>
              <h2 id={`${rangeId}-heading`}>{copy.trySize}</h2>
              <span
                aria-live="polite"
                className="font-preview-state"
                data-preview-state={previewState}
              >
                {previewState === 'ready'
                  ? copy.ready
                  : previewState === 'loading'
                    ? copy.loading
                    : previewState === 'unavailable'
                      ? copy.unavailable
                      : copy.failed}
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
            aria-label={`${copy.previewLabel}: ${font.facts.family}`}
            onChange={(event) => setSample(event.currentTarget.value)}
            spellCheck="false"
            style={{ fontFamily: `${previewFace}, var(--sans)`, fontSize: `${size}px` }}
            value={sample}
          />
        </section>

        <div className="font-detail-columns">
          <section>
            <p className="font-detail-kicker">{copy.about}</p>
            <h2>{copy.brings}</h2>
            {content.about.map((paragraph) => (
              <p className="font-detail-copy" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
          <section>
            <p className="font-detail-kicker">{copy.uses}</p>
            <ul className="font-use-cases">
              {content.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </section>
        </div>

        <CoveragePanel font={font.facts} locale={content.locale} />

        <section className="font-download-panel">
          <div>
            <p className="font-detail-kicker">{copy.verified}</p>
            <h2>
              {copy.download} {font.facts.family}
            </h2>
            <p className="font-download-copy">
              {copy.downloadCopy} {font.release.releaseVersion}.
            </p>
          </div>
          <div className="font-download-actions">
            <a href={font.release.package.url} download>
              <Download aria-hidden="true" /> {copy.zip}
            </a>
            <a className="font-license-link" href={font.release.license.url}>
              <ShieldCheck aria-hidden="true" /> {copy.readLicense}
            </a>
          </div>
        </section>
      </div>
    </article>
  )
}

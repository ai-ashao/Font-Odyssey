import type { Locale } from '@/i18n/config'
import { fontDownloadSources } from '@/lib/font-assets'
import { type FontCatalogItem, fontLanguages } from '@/lib/font-catalog'
import type { PublishedFont } from '@/lib/font-publishing'
import { findFontHub, fontHubPath } from '@/lib/font-routes'
import { PublishedFontDetailContent } from './font-detail-content'
import { FontSpecimen } from './font-preview'

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

      <FontSpecimen key={font.slug} font={font} locale={locale} />

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

  return (
    <PublishedFontDetailContent
      content={content}
      font={font}
      locale={locale}
      coverage={<CoveragePanel font={font.facts} locale={locale} />}
    />
  )
}

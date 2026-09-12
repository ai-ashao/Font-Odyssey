import { ArrowLeft, Download, ShieldCheck } from 'lucide-react'
import { type ReactNode, useId } from 'react'
import type { Locale } from '@/i18n/config'
import { fontDownloadSources, fontOfficialSourceUrl } from '@/lib/font-assets'
import { formatPackageBytes } from '@/lib/font-preview-contract'
import type { PublishedFont } from '@/lib/font-publishing'
import { relatedFontsFor, relatedHubIdsFor } from '@/lib/font-related'
import { findFontHub, fontHubPath, fontPath } from '@/lib/font-routes'
import { FontSpecimen } from './font-preview'

export function PublishedFontDetailContent({
  content,
  font,
  locale,
  coverage,
}: Readonly<{
  content: NonNullable<PublishedFont['content'][Locale]>
  font: PublishedFont
  locale: Locale
  coverage: ReactNode
}>) {
  const index = locale === 'en' ? 0 : locale === 'zh-CN' ? 1 : 2
  const text = (en: string, cn: string, tw: string) => [en, cn, tw][index]
  const directoryPath =
    locale === 'en' ? '/fonts' : locale === 'zh-CN' ? '/zh/fonts' : '/zh-tw/fonts'
  const downloadSources = fontDownloadSources(font.facts, locale, font.release.package.url)
  const packageLabel = `ZIP · ${formatPackageBytes(font.release.package.bytes)}`
  const downloadSectionId = 'font-download'
  const downloadTitleId = useId()
  const relatedTitleId = useId()
  const relatedFonts = relatedFontsFor(font.facts, 4)
  const relatedHubs = relatedHubIdsFor(font.facts).flatMap((id) => {
    const hub = findFontHub(id)
    return hub ? [hub] : []
  })
  return (
    <article className="font-detail fo-detail" data-font-detail={font.facts.slug}>
      <div className="font-detail-inner">
        <a className="font-detail-back" href={directoryPath}>
          <ArrowLeft aria-hidden="true" /> {text('All fonts', '全部字体', '全部字體')}
        </a>
        <header className="font-detail-hero">
          <div>
            <p className="font-detail-kicker">
              {text('Curated', '精选', '精選')} #{String(font.facts.curationRank).padStart(3, '0')}{' '}
              · {font.facts.category}
            </p>
            <h1>{content.h1}</h1>
            <p>{content.intro}</p>
            <div className="fo-detail-quick-actions">
              <a
                className="fo-primary-button"
                href={`#${downloadSectionId}`}
                aria-label={`${text('Download options for', '跳至下载选项：', '跳至下載選項：')} ${font.facts.family}`}
              >
                <Download aria-hidden="true" />
                {text('Download font', '下载字体', '下載字體')}
              </a>
              <span>{packageLabel}</span>
              <a className="fo-text-link" href={font.release.license.url}>
                {text('Read license', '阅读许可证', '閱讀授權')}
              </a>
            </div>
          </div>
          <dl className="font-detail-facts">
            <div>
              <dt>{text('Styles', '样式', '樣式')}</dt>
              <dd>{font.facts.styleCount}</dd>
            </div>
            <div>
              <dt>{text('Axes', '可变轴', '可變軸')}</dt>
              <dd>
                {font.facts.axes.length
                  ? font.facts.axes.join(', ')
                  : text('Static', '静态', '靜態')}
              </dd>
            </div>
            <div>
              <dt>{text('License', '许可证', '授權')}</dt>
              <dd>{font.facts.license}</dd>
            </div>
          </dl>
        </header>
        <FontSpecimen
          key={`${font.facts.slug}:${font.release.releaseVersion}`}
          font={font.facts}
          release={font.release}
          locale={locale}
        />
        <section
          className="font-download-panel"
          id={downloadSectionId}
          tabIndex={-1}
          aria-labelledby={downloadTitleId}
        >
          <div>
            <p className="font-detail-kicker">
              {text('Verified release', '已验证版本', '已驗證版本')}
            </p>
            <h2 id={downloadTitleId}>
              {text('Download', '下载', '下載')} {font.facts.family}
            </h2>
            <p className="fo-package-size">{packageLabel}</p>
            <p className="font-download-copy">
              {text(
                'Original font files, source notice, and license text.',
                '原始字体文件、来源说明与许可证文本。',
                '原始字體檔、來源說明與授權文字。',
              )}
            </p>
            <p className="fo-release-version">
              {text('Release', '版本', '版本')} {font.release.releaseVersion}
            </p>
          </div>
          <div className="font-download-actions">
            {downloadSources.map((source) => (
              <a
                className={source.primary ? undefined : 'font-license-link'}
                href={source.url}
                key={source.id}
                rel={source.sponsored ? 'sponsored nofollow noopener' : 'noopener'}
                target="_blank"
              >
                <Download aria-hidden="true" />
                {source.label}
              </a>
            ))}
            <a className="font-license-link" href={font.release.license.url}>
              <ShieldCheck aria-hidden="true" />
              {text('Read license', '阅读许可证', '閱讀授權')}
            </a>
            <a
              className="font-license-link"
              href={fontOfficialSourceUrl(font.facts)}
              rel="noopener"
              target="_blank"
            >
              {text('Official source', '官方来源', '官方來源')} ↗
            </a>
          </div>
        </section>
        <div className="font-detail-columns">
          <section>
            <p className="font-detail-kicker">
              {text('About the family', '关于这个字体家族', '關於這個字體家族')}
            </p>
            <h2>
              {text('What it brings to a layout', '它能为版面带来什么', '它能為版面帶來什麼')}
            </h2>
            {content.about.map((paragraph) => (
              <p className="font-detail-copy" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
          <section>
            <p className="font-detail-kicker">
              {text('Common uses for this category', '该类别常见用途', '此類別常見用途')}
            </p>
            <ul className="font-use-cases">
              {content.useCases.map((useCase) => (
                <li key={useCase}>{useCase}</li>
              ))}
            </ul>
          </section>
        </div>
        {coverage}
        <section className="mt-12 border-t pt-9" aria-labelledby={relatedTitleId}>
          <p className="font-detail-kicker">{text('Keep exploring', '继续探索', '繼續探索')}</p>
          <h2 id={relatedTitleId}>{text('Similar fonts', '相似字体', '相似字體')}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedFonts.map((related) => (
              <a
                className="rounded-2xl border bg-card p-4 transition hover:border-primary/50"
                href={fontPath(related, locale)}
                key={related.slug}
              >
                <strong className="block text-base">{related.family}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {related.category} · {related.styleCount} {text('styles', '种样式', '種樣式')}
                </span>
              </a>
            ))}
          </div>
          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label={text('Related collections', '相关合集', '相關合集')}
          >
            {relatedHubs.map((hub) => (
              <a
                className="rounded-full border px-3 py-1.5 text-sm font-medium"
                href={fontHubPath(hub, locale)}
                key={hub.id}
              >
                {hub.localized[locale].title}
              </a>
            ))}
          </nav>
        </section>
      </div>
    </article>
  )
}

import { Search } from 'lucide-react'
import { useState } from 'react'
import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'
import { fontCatalog } from '@/lib/font-catalog'
import { type FontHubId, findFontHub, fontHubPath, fontsForHub } from '@/lib/font-routes'
import { FontCard } from './font-card'
import { FontSpecimen } from './font-preview'

const languageHubs = ['chinese', 'japanese', 'korean', 'latin'] satisfies FontHubId[]
const styleHubs = [
  'sans-serif',
  'serif',
  'display',
  'handwriting',
  'monospace',
] satisfies FontHubId[]

const languageSpecimens: Record<FontHubId, string> = {
  chinese: '字体',
  japanese: 'かな',
  korean: '한글',
  latin: 'Aa',
  'sans-serif': 'Aa',
  serif: 'Aa',
  display: 'Aa',
  handwriting: 'Aa',
  monospace: '01',
  'free-commercial': 'Aa',
  'variable-fonts': 'Aa',
}

export function FontHome({ locale }: Readonly<{ locale: Locale }>) {
  const collectionsId = 'collections'
  const copy =
    locale === 'zh-CN'
      ? {
          eyebrow: '149 款精选字体 · 来源可追溯',
          title: '免费字体下载与多语言字体精选',
          description:
            '搜索字体名称，快速比较许可证、语言支持、字重和已验证来源。先找到字体，再决定是否下载。',
          search: '搜索字体名称',
          quickCollections: '快速字体合集',
          browse: '浏览全部字体',
          featured: '热门精选',
          featuredCopy: '从 149 个已验证字体家族中快速开始。',
          languages: '按语言浏览',
          languageCopy: '中文、日文、韩文和拉丁字体分别建立独立入口。',
          styles: '按风格浏览',
          styleCopy: '用真实分类缩小范围，再进入字体详情页比较。',
          commercial: '免费商用字体',
          variable: '可变字体',
          previewLabel: '预览文字',
          defaultPreview: '让每一段文字都值得被读。',
          verified: '已验证资源',
          verifiedShort: '149 已验证',
          familyUnit: '个字体家族',
          downloadReady: '149 个字体家族均有已验证下载版本',
          trust: '下载之前就能看到关键事实',
          trustCopy: '字体详情页把许可证、字符覆盖、样式、来源与下载放在同一条决策链上。',
          faq: '下载前常见问题',
        }
      : locale === 'zh-TW'
        ? {
            eyebrow: '149 款精選字體 · 來源可追溯',
            title: '免費字體下載與多語言字體精選',
            description:
              '搜尋字體名稱，快速比較授權、語言支援、字重與已驗證來源。先找到字體，再決定是否下載。',
            search: '搜尋字體名稱',
            quickCollections: '快速字體合集',
            browse: '瀏覽全部字體',
            featured: '熱門精選',
            featuredCopy: '從 149 個已驗證字體家族中快速開始。',
            languages: '依語言瀏覽',
            languageCopy: '中文、日文、韓文與拉丁字體分別建立獨立入口。',
            styles: '依風格瀏覽',
            styleCopy: '用真實分類縮小範圍，再進入字體詳情頁比較。',
            commercial: '免費商用字體',
            variable: '可變字體',
            previewLabel: '預覽文字',
            defaultPreview: '讓每一段文字都值得被讀。',
            verified: '已驗證資源',
            verifiedShort: '149 已驗證',
            familyUnit: '個字體家族',
            downloadReady: '149 個字體家族均有已驗證下載版本',
            trust: '下載之前就能看到關鍵事實',
            trustCopy: '字體詳情頁把授權、字元覆蓋、樣式、來源與下載放在同一條決策鏈上。',
            faq: '下載前常見問題',
          }
        : {
            eyebrow: '149 CURATED FAMILIES · TRACEABLE SOURCES',
            title: 'Free Font Downloads — Curated Multilingual Fonts',
            description:
              'Search by font name, compare licensing and language support, then download a verified release when the family fits your project.',
            search: 'Search font names',
            quickCollections: 'Quick font collections',
            browse: 'Browse all fonts',
            featured: 'Featured fonts',
            featuredCopy: 'Start with a focused set from 149 verified font families.',
            languages: 'Browse by language',
            languageCopy:
              'Move directly into dedicated Chinese, Japanese, Korean, and Latin collections.',
            styles: 'Browse by style',
            styleCopy:
              'Use real catalog categories to narrow the directory before opening a font detail page.',
            commercial: 'Commercial-use fonts',
            variable: 'Variable fonts',
            previewLabel: 'Preview text',
            defaultPreview: 'Make something worth reading.',
            verified: 'VERIFIED RELEASES',
            verifiedShort: '149 verified',
            familyUnit: 'families',
            downloadReady: 'Verified download availability across all 149 catalog families',
            trust: 'Key facts stay close to the download decision',
            trustCopy:
              'Each detail page keeps license, measured coverage, styles, source, and download controls together.',
            faq: 'Before you download',
          }

  const [previewText, setPreviewText] = useState<string | undefined>(undefined)
  const fontDirectory = localizedPathOrDefault('fonts', locale)
  const heroSlug = locale === 'zh-CN' ? 'notoserifsc' : locale === 'zh-TW' ? 'notoseriftc' : 'inter'
  const heroFont = fontCatalog.find((font) => font.slug === heroSlug) ?? fontCatalog[0]

  return (
    <div className="prototype-home" data-product-mode-home="tool" data-font-home>
      <section className="prototype-hero">
        <p className="prototype-eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="prototype-hero-copy">{copy.description}</p>

        <form action={fontDirectory} className="prototype-search">
          <Search aria-hidden="true" />
          <input aria-label={copy.search} name="q" placeholder={`${copy.search}…`} type="search" />
          <span className="prototype-search-status">{copy.verifiedShort}</span>
          <button type="submit">{copy.browse}</button>
        </form>

        <nav className="prototype-quick-links" aria-label={copy.quickCollections}>
          <a href={fontHubPath('chinese', locale)}>
            {locale === 'en' ? 'Chinese Fonts' : locale === 'zh-CN' ? '中文字体' : '中文字體'}
          </a>
          <a href={fontHubPath('free-commercial', locale)}>{copy.commercial}</a>
          <a href={fontHubPath('variable-fonts', locale)}>{copy.variable}</a>
        </nav>

        {heroFont ? (
          <FontSpecimen
            key={`${locale}:${heroFont.slug}`}
            font={heroFont}
            locale={locale}
            compact
            onTextChange={setPreviewText}
          />
        ) : null}
      </section>

      <section className="prototype-section prototype-featured">
        <SectionHeading
          eyebrow={locale === 'en' ? 'CURATED PICKS' : locale === 'zh-CN' ? '精选推荐' : '精選推薦'}
          title={copy.featured}
          description={copy.featuredCopy}
          href={fontDirectory}
          link={copy.browse}
        />
        <div className="prototype-font-grid">
          {fontCatalog.slice(0, 12).map((font) => (
            <FontCard font={font} key={font.slug} locale={locale} previewText={previewText} />
          ))}
        </div>
      </section>

      <section className="prototype-section prototype-language-section" id={collectionsId}>
        <SectionHeading
          eyebrow={
            locale === 'en' ? 'LANGUAGE COLLECTIONS' : locale === 'zh-CN' ? '语言合集' : '語言合集'
          }
          title={copy.languages}
          description={copy.languageCopy}
        />
        <div className="prototype-language-grid">
          {languageHubs.map((id) => {
            const hub = findFontHub(id)
            if (!hub) return null
            const count = fontsForHub(hub).length
            return (
              <a href={fontHubPath(id, locale)} key={id}>
                <span className="prototype-language-sample">{languageSpecimens[id]}</span>
                <span className="prototype-language-meta">
                  <strong>{hub.localized[locale].title}</strong>
                  <small>
                    {count} {copy.familyUnit}
                  </small>
                </span>
              </a>
            )
          })}
        </div>
      </section>

      <section className="prototype-section prototype-style-section">
        <SectionHeading
          eyebrow={locale === 'en' ? 'STYLE BROWSER' : locale === 'zh-CN' ? '字体风格' : '字體風格'}
          title={copy.styles}
          description={copy.styleCopy}
        />
        <div className="prototype-style-list">
          {styleHubs.map((id) => {
            const hub = findFontHub(id)
            if (!hub) return null
            return (
              <a href={fontHubPath(id, locale)} key={id}>
                <strong>{hub.localized[locale].title}</strong>
                <span>{fontsForHub(hub).length}</span>
                <span aria-hidden="true">↗</span>
              </a>
            )
          })}
        </div>
      </section>

      <section className="prototype-trust">
        <div className="prototype-trust-inner">
          <div>
            <p className="prototype-trust-kicker">{copy.verified}</p>
            <h2>{copy.trust}</h2>
            <p>{copy.trustCopy}</p>
          </div>
          <div className="prototype-trust-stats">
            <div>
              <strong>149</strong>
              <span>{copy.downloadReady}</span>
            </div>
            <div>
              <strong>3</strong>
              <span>
                {locale === 'en'
                  ? 'Localized page families'
                  : locale === 'zh-CN'
                    ? '本地化语言版本'
                    : '本地化語言版本'}
              </span>
            </div>
            <div>
              <strong>SHA-256</strong>
              <span>
                {locale === 'en'
                  ? 'Remote release verification'
                  : locale === 'zh-CN'
                    ? '远程发布校验'
                    : '遠端發布校驗'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="prototype-section prototype-faq">
        <SectionHeading eyebrow="FAQ" title={copy.faq} />
        <div className="prototype-faq-grid">
          <Faq
            q={
              locale === 'en'
                ? 'Are all FontOdyssey fonts free for commercial use?'
                : locale === 'zh-CN'
                  ? '所有 FontOdyssey 字体都可以免费商用吗？'
                  : '所有 FontOdyssey 字體都可以免費商用嗎？'
            }
            a={
              locale === 'en'
                ? 'The catalog only publishes families that pass the current redistribution gate, but each project should still review the font-specific license and Reserved Font Name conditions.'
                : locale === 'zh-CN'
                  ? '目录只发布通过当前再分发门禁的字体，但用于具体项目时仍应查看字体详情页中的许可证与保留字体名称条件。'
                  : '目錄只發布通過目前再散布門檻的字體，但用於具體專案時仍應查看字體詳情頁中的授權與保留字體名稱條件。'
            }
          />
          <Faq
            q={
              locale === 'en'
                ? 'What does verified download availability mean?'
                : locale === 'zh-CN'
                  ? '“已验证下载”是什么意思？'
                  : '「已驗證下載」是什麼意思？'
            }
            a={
              locale === 'en'
                ? 'Verified download availability means the published R2 object was read back over HTTPS and checked against the stored release metadata.'
                : locale === 'zh-CN'
                  ? '表示发布到 R2 的对象已经通过 HTTPS 远程回读，并与发布清单中的校验信息一致。'
                  : '表示發布到 R2 的物件已經通過 HTTPS 遠端回讀，並與發布清單中的校驗資訊一致。'
            }
          />
        </div>
      </section>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  link,
}: Readonly<{
  eyebrow: string
  title: string
  description?: string
  href?: string
  link?: string
}>) {
  return (
    <div className="prototype-section-heading">
      <div>
        <p className="prototype-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="prototype-section-side">
        {description ? <p>{description}</p> : null}
        {href && link ? <a href={href}>{link} →</a> : null}
      </div>
    </div>
  )
}

function Faq({ q, a }: Readonly<{ q: string; a: string }>) {
  return (
    <article>
      <h3>{q}</h3>
      <p>{a}</p>
    </article>
  )
}

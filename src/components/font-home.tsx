import { useId, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'
import { fontCatalog } from '@/lib/font-catalog'
import { type FontHubId, findFontHub, fontHubPath } from '@/lib/font-routes'
import { FontCard } from './font-card'

const languageHubs = ['chinese', 'japanese', 'korean', 'latin'] satisfies FontHubId[]
const styleHubs = [
  'sans-serif',
  'serif',
  'display',
  'handwriting',
  'monospace',
] satisfies FontHubId[]
const collectionHubs = ['free-commercial', 'variable-fonts'] satisfies FontHubId[]

export function FontHome({ locale }: Readonly<{ locale: Locale }>) {
  const previewId = useId()
  const copy =
    locale === 'zh-CN'
      ? {
          eyebrow: '149 款精选字体 · 来源可追溯',
          title: '免费字体下载与多语言字体精选',
          description:
            '从精选的中文、日文、韩文和拉丁字体中快速找到值得使用的字体。查看许可证、语言支持、字重与官方来源，再决定下载。',
          search: '搜索字体名称',
          browse: '浏览全部字体',
          featured: '热门精选',
          featuredCopy: '从经过许可门禁的 149 个字体家族中开始探索。',
          languages: '按语言浏览',
          languageCopy: '中文、日文、韩文和拉丁字体分别建立清晰的主题入口。',
          styles: '按风格浏览',
          styleCopy: '按字体风格快速比较相关家族，不必在庞大的字体目录里反复翻找。',
          commercial: '免费商用字体',
          commercialCopy:
            '这里收录的字体已通过当前资源许可门禁。用于商业项目时，仍应在字体详情页确认具体许可证和保留字体名等要求。',
          chinese: '中文字体更需要看覆盖范围',
          chineseCopy:
            '简体和繁体支持并不等价。FontOdyssey 直接展示实测字符覆盖率，帮助你在下载前发现缺字风险。',
          trust: '来源和许可证不是下载后的附注',
          trustCopy:
            '每个字体详情页都把来源、许可证、样式和语言支持放在下载附近，让用户在下载前完成判断。',
          faq: '下载前常见问题',
          previewLabel: '预览文字',
          defaultPreview: '让每一段文字都值得被读。',
        }
      : locale === 'zh-TW'
        ? {
            eyebrow: '149 款精選字體 · 來源可追溯',
            title: '免費字體下載與多語言字體精選',
            description:
              '從精選的中文、日文、韓文與拉丁字體中快速找到值得使用的字體。查看授權、語言支援、字重與官方來源，再決定下載。',
            search: '搜尋字體名稱',
            browse: '瀏覽全部字體',
            featured: '熱門精選',
            featuredCopy: '從通過授權門檻的 149 個字體家族開始探索。',
            languages: '依語言瀏覽',
            languageCopy: '中文、日文、韓文與拉丁字體分別建立清楚的主題入口。',
            styles: '依風格瀏覽',
            styleCopy: '依字體風格快速比較相關家族，不必在龐大的字體目錄裡反覆翻找。',
            commercial: '免費商用字體',
            commercialCopy:
              '這裡收錄的字體已通過目前資源授權門檻。用於商業專案時，仍應在字體詳情頁確認具體授權與保留字體名稱等要求。',
            chinese: '中文字體更需要看覆蓋範圍',
            chineseCopy:
              '簡體與繁體支援並不相同。FontOdyssey 直接展示實測字元覆蓋率，幫助你在下載前發現缺字風險。',
            trust: '來源與授權不是下載後的附註',
            trustCopy:
              '每個字體詳情頁都把來源、授權、樣式與語言支援放在下載附近，讓使用者在下載前完成判斷。',
            faq: '下載前常見問題',
            previewLabel: '預覽文字',
            defaultPreview: '讓每一段文字都值得被讀。',
          }
        : {
            eyebrow: '149 CURATED FAMILIES · TRACEABLE SOURCES',
            title: 'Free Font Downloads — Curated Multilingual Fonts',
            description:
              'Discover curated Latin, Chinese, Japanese, and Korean fonts. Review licensing, language support, styles, and official sources before you download.',
            search: 'Search font names',
            browse: 'Browse all fonts',
            featured: 'Featured fonts',
            featuredCopy: 'Start with 149 families that passed the current license gate.',
            languages: 'Browse by language',
            languageCopy:
              'Explore dedicated discovery pages for Chinese, Japanese, Korean, and Latin fonts.',
            styles: 'Browse by style',
            styleCopy:
              'Compare focused font collections by style without digging through an endless catalog.',
            commercial: 'Free fonts for commercial use',
            commercialCopy:
              'The catalog contains open-license families that passed the current redistribution gate. Always review the individual font license and reserved-name conditions before commercial use.',
            chinese: 'Chinese fonts need better coverage signals',
            chineseCopy:
              'Simplified and Traditional Chinese support are not interchangeable. FontOdyssey surfaces measured character coverage so missing-glyph risk is visible before download.',
            trust: 'Source and license are part of the product',
            trustCopy:
              'Every font detail page keeps source, license, styles, and language support next to the download decision instead of hiding them in a footnote.',
            faq: 'Before you download',
            previewLabel: 'Preview text',
            defaultPreview: 'Make something worth reading.',
          }

  const [previewText, setPreviewText] = useState(copy.defaultPreview)
  const fontDirectory = localizedPathOrDefault('fonts', locale)

  return (
    <div data-product-mode-home="tool" data-font-home>
      <section className="mx-auto grid max-w-[1180px] gap-9 px-5 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            {copy.description}
          </p>
          <form action={fontDirectory} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <input
              aria-label={copy.search}
              className="h-12 min-w-0 flex-1 rounded-xl border bg-card px-4 text-base shadow-sm"
              name="q"
              placeholder={`${copy.search}…`}
              type="search"
            />
            <button
              className="h-12 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              type="submit"
            >
              {copy.browse}
            </button>
          </form>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <label
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            htmlFor={previewId}
          >
            {copy.previewLabel}
          </label>
          <textarea
            className="mt-3 min-h-24 w-full resize-none border-0 bg-transparent p-0 text-2xl font-medium leading-snug outline-none"
            id={previewId}
            maxLength={90}
            onChange={(event) => setPreviewText(event.currentTarget.value || copy.defaultPreview)}
            value={previewText}
          />
          <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
            {locale === 'en'
              ? 'Preview copy updates the featured cards. Real font faces load automatically after a preview asset passes remote verification.'
              : locale === 'zh-CN'
                ? '预览文字会同步到精选卡片；预览资源通过远程验证后会自动加载真实字体。'
                : '預覽文字會同步到精選卡片；預覽資源通過遠端驗證後會自動載入真實字體。'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-6">
        <SectionHeading
          title={copy.featured}
          description={copy.featuredCopy}
          href={fontDirectory}
          link={copy.browse}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fontCatalog.slice(0, 12).map((font) => (
            <FontCard font={font} key={font.slug} locale={locale} previewText={previewText} />
          ))}
        </div>
      </section>

      <section className="border-y bg-card/45">
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-6">
          <SectionHeading title={copy.languages} description={copy.languageCopy} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {languageHubs.map((id) => (
              <HubCard id={id} key={id} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">STYLE HUBS</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{copy.styles}</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">{copy.styleCopy}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {styleHubs.map((id) => (
            <HubRow id={id} key={id} locale={locale} />
          ))}
        </div>
      </section>

      <section className="border-y bg-card/50">
        <div className="mx-auto grid max-w-[1180px] gap-4 px-5 py-14 sm:px-6 md:grid-cols-2">
          <FeaturePanel
            href={fontHubPath('free-commercial', locale)}
            title={copy.commercial}
            description={copy.commercialCopy}
            action={
              locale === 'en'
                ? 'Browse commercial-use fonts'
                : locale === 'zh-CN'
                  ? '浏览商用字体'
                  : '瀏覽商用字體'
            }
          />
          <FeaturePanel
            href={fontHubPath('chinese', locale)}
            title={copy.chinese}
            description={copy.chineseCopy}
            action={
              locale === 'en'
                ? 'Browse Chinese fonts'
                : locale === 'zh-CN'
                  ? '浏览中文字体'
                  : '瀏覽中文字體'
            }
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-6">
        <SectionHeading
          title={
            locale === 'en' ? 'Curated collections' : locale === 'zh-CN' ? '精选合集' : '精選合集'
          }
          description={
            locale === 'en'
              ? 'Useful collections group related fonts by language, style, and practical use so strong candidates are easier to compare.'
              : locale === 'zh-CN'
                ? '合集按语言、风格和真实使用需求组织字体，让适合的候选更容易比较。'
                : '合集依語言、風格與真實使用需求整理字體，讓合適的候選更容易比較。'
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {collectionHubs.map((id) => (
            <HubCard id={id} key={id} locale={locale} />
          ))}
        </div>
      </section>

      <section className="border-y bg-foreground text-background">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-14 sm:px-6 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-orange-300">
              LICENSE & SOURCE
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{copy.trust}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{copy.trustCopy}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TrustItem
              title={
                locale === 'en'
                  ? 'License checked'
                  : locale === 'zh-CN'
                    ? '许可证已检查'
                    : '授權已檢查'
              }
            />
            <TrustItem
              title={
                locale === 'en'
                  ? 'Official source fallback'
                  : locale === 'zh-CN'
                    ? '官方来源可追溯'
                    : '官方來源可追溯'
              }
            />
            <TrustItem
              title={
                locale === 'en'
                  ? 'Language metadata'
                  : locale === 'zh-CN'
                    ? '语言支持信息'
                    : '語言支援資訊'
              }
            />
            <TrustItem
              title={
                locale === 'en'
                  ? 'Verified download availability'
                  : locale === 'zh-CN'
                    ? '不伪造下载链接'
                    : '不偽造下載連結'
              }
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{copy.faq}</h2>
        <div className="mt-7 divide-y border-y">
          <Faq locale={locale} index={0} />
          <Faq locale={locale} index={1} />
          <Faq locale={locale} index={2} />
          <Faq locale={locale} index={3} />
        </div>
      </section>
    </div>
  )
}

function SectionHeading({
  title,
  description,
  href,
  link,
}: Readonly<{ title: string; description: string; href?: string; link?: string }>) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {href && link ? (
        <a className="shrink-0 text-sm font-semibold text-primary" href={href}>
          {link} →
        </a>
      ) : null}
    </div>
  )
}

function HubCard({ id, locale }: Readonly<{ id: FontHubId; locale: Locale }>) {
  const hub = findFontHub(id)
  if (!hub) return null
  const copy = hub.localized[locale]
  return (
    <a
      className="rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30"
      href={fontHubPath(hub, locale)}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {copy.eyebrow}
      </span>
      <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em]">{copy.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>
      <div className="mt-5 text-sm font-semibold text-primary">Explore →</div>
    </a>
  )
}

function HubRow({ id, locale }: Readonly<{ id: FontHubId; locale: Locale }>) {
  const hub = findFontHub(id)
  if (!hub) return null
  const copy = hub.localized[locale]
  return (
    <a
      className="flex min-h-16 items-center justify-between gap-4 rounded-xl border bg-card px-4 font-semibold"
      href={fontHubPath(hub, locale)}
    >
      <span>{copy.title}</span>
      <span className="text-muted-foreground">→</span>
    </a>
  )
}

function FeaturePanel({
  title,
  description,
  href,
  action,
}: Readonly<{ title: string; description: string; href: string; action: string }>) {
  return (
    <article className="rounded-2xl border bg-background p-6">
      <h2 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
      <a className="mt-6 inline-flex text-sm font-semibold text-primary" href={href}>
        {action} →
      </a>
    </article>
  )
}

function TrustItem({ title }: Readonly<{ title: string }>) {
  return (
    <div className="border-t border-white/15 pt-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        FontOdyssey keeps this information visible before the download decision.
      </p>
    </div>
  )
}

function Faq({ locale, index }: Readonly<{ locale: Locale; index: number }>) {
  const questions = {
    en: [
      [
        'Are all FontOdyssey fonts free for commercial use?',
        'The launch catalog passed the current license gate, but each font can have its own obligations. Review the individual license on the font page before commercial use.',
      ],
      [
        'Where do the font files come from?',
        'FontOdyssey records traceable upstream sources. Until a verified R2 package exists, the site falls back to the official source instead of inventing a local download.',
      ],
      [
        'Do Chinese fonts support both Simplified and Traditional Chinese?',
        'Not necessarily. The current catalog exposes subset metadata, and the ingestion pipeline can later add measured glyph coverage for more precise decisions.',
      ],
      [
        'Can I preview a font before downloading?',
        'Yes when a preview WOFF2 asset has been published. The UI is already wired to load preview assets from the configured FontOdyssey R2 domain.',
      ],
    ],
    'zh-CN': [
      [
        '所有 FontOdyssey 字体都可以免费商用吗？',
        '首发目录已经通过当前许可门禁，但每款字体仍可能有不同义务。商业使用前请在字体详情页检查具体许可证。',
      ],
      [
        '字体文件来自哪里？',
        'FontOdyssey 保留可追溯的上游来源。R2 文件尚未验证时，网站会回退到官方来源，而不是伪造本站下载。',
      ],
      [
        '中文字体一定同时支持简体和繁体吗？',
        '不一定。当前目录会展示 subset 信息，后续 ingestion pipeline 还可以继续补充实测字符覆盖率。',
      ],
      [
        '下载前可以预览吗？',
        '可以。只要对应 preview WOFF2 已发布，页面会自动从配置的 FontOdyssey R2 域名加载真实字体预览。',
      ],
    ],
    'zh-TW': [
      [
        '所有 FontOdyssey 字體都能免費商用嗎？',
        '首發目錄已通過目前的授權門檻，但每款字體仍可能有不同義務。商業使用前請在字體詳情頁檢查具體授權。',
      ],
      [
        '字體檔案來自哪裡？',
        'FontOdyssey 保留可追溯的上游來源。R2 檔案尚未驗證時，網站會回退到官方來源，而不是偽造本站下載。',
      ],
      [
        '中文字體一定同時支援簡體與繁體嗎？',
        '不一定。目前目錄會顯示 subset 資訊，後續 ingestion pipeline 還能繼續補充實測字元覆蓋率。',
      ],
      [
        '下載前可以預覽嗎？',
        '可以。只要對應 preview WOFF2 已發布，頁面就會自動從設定的 FontOdyssey R2 網域載入真實字體預覽。',
      ],
    ],
  } satisfies Record<Locale, Array<[string, string]>>
  const item = questions[locale][index]
  if (!item) return null
  return (
    <details className="py-5">
      <summary className="cursor-pointer font-semibold">{item[0]}</summary>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{item[1]}</p>
    </details>
  )
}

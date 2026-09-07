import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'
import { fontCatalog } from '@/lib/font-catalog'
import { FontCard } from './font-card'

export function FontHome({ locale }: Readonly<{ locale: Locale }>) {
  const copy =
    locale === 'zh-CN'
      ? {
          eyebrow: '小而美的字体下载站',
          title: '少一点堆砌，多一点好字体。',
          description:
            'FontOdyssey 精选热门、多语言、可合法分发的字体，让你更快找到真正值得使用的那一个。',
          action: '浏览全部 149 个字体',
          section: '热门精选',
        }
      : {
          eyebrow: 'A SMALL, BEAUTIFUL FONT LIBRARY',
          title: 'Fewer fonts. Better discoveries.',
          description:
            'FontOdyssey curates popular, multilingual, redistribution-ready typefaces so the right font is easier to find.',
          action: 'Explore all 149 fonts',
          section: 'Featured fonts',
        }
  return (
    <div data-product-mode-home="tool" data-font-home>
      <section className="mx-auto max-w-[1180px] px-5 pb-12 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{copy.eyebrow}</p>
        <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          {copy.description}
        </p>
        <a
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          href={localizedPathOrDefault('fonts', locale)}
        >
          {copy.action}
        </a>
      </section>
      <section className="mx-auto max-w-[1180px] px-5 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">{copy.section}</h2>
          <a
            className="text-sm font-medium text-primary"
            href={localizedPathOrDefault('fonts', locale)}
          >
            {copy.action} →
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fontCatalog.slice(0, 12).map((font) => (
            <FontCard font={font} key={font.slug} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  )
}

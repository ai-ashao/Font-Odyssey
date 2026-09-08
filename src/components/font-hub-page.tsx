import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'
import { type FontHubDefinition, fontsForHub } from '@/lib/font-routes'
import { FontCard } from './font-card'

export function FontHubPage({
  hub,
  locale,
}: Readonly<{ hub: FontHubDefinition | undefined; locale: Locale }>) {
  if (!hub) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl font-semibold">
          {locale === 'en'
            ? 'Font collection not found'
            : locale === 'zh-CN'
              ? '没有找到这个字体合集'
              : '找不到這個字體合集'}
        </h1>
      </section>
    )
  }

  const fonts = fontsForHub(hub)
  const copy = hub.localized[locale]

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-6 sm:py-16" data-font-hub={hub.id}>
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{copy.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {copy.description}
        </p>
        <p className="mt-4 text-sm font-medium">
          {fonts.length}{' '}
          {locale === 'en' ? 'font families' : locale === 'zh-CN' ? '个字体家族' : '個字體家族'}
        </p>
      </header>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fonts.map((font) => (
          <FontCard font={font} key={font.slug} locale={locale} />
        ))}
      </div>

      <div className="mt-10 border-t pt-7 text-center">
        <a
          className="text-sm font-semibold text-primary"
          href={localizedPathOrDefault('fonts', locale)}
        >
          {locale === 'en'
            ? 'Browse the full font directory'
            : locale === 'zh-CN'
              ? '浏览完整字体目录'
              : '瀏覽完整字體目錄'}{' '}
          →
        </a>
      </div>
    </section>
  )
}

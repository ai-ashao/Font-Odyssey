import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'
import { type FontHubDefinition, fontsForHub } from '@/lib/font-routes'
import { fontHubEditorialContent } from '@/modules/font-hub-editorial-content'
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
  const editorial = fontHubEditorialContent(hub.id, locale)

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

      {editorial ? (
        <div className="mx-auto mt-16 max-w-5xl border-t pt-12 sm:mt-20 sm:pt-16">
          <section aria-labelledby={`${hub.id}-guide`}>
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id={`${hub.id}-guide`}
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                {editorial.heading}
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                {editorial.introduction}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {editorial.guidance.map((item) => (
                <article className="rounded-2xl border bg-card p-6" key={item.title}>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14" aria-labelledby={`${hub.id}-faq`}>
            <h2 id={`${hub.id}-faq`} className="text-2xl font-semibold tracking-tight">
              {editorial.faqHeading}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {editorial.faq.map((item) => (
                <article className="rounded-2xl bg-muted/45 p-6" key={item.title}>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

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

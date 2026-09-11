import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { ChevronDown, Globe2, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import usabilityStyles from '@/font-usability.css?url'
import { type Locale, localeConfig, localeFromPathname } from '@/i18n/config'
import { shellMessages } from '@/i18n/messages'
import { localeAlternatesForPath, localizedPathOrDefault } from '@/i18n/routes'
import { publicEnv } from '@/lib/config/env'
import { productConfig, surfaceModeForPath } from '@/lib/product-config'
import { site } from '@/lib/site'
import {
  type HeaderLinkId,
  localizedNavigationValue,
  type SiteNavigationConfig,
  siteNavigationForMode,
} from '@/lib/site-navigation'
import skinStyles from '@/prototype-v34.css?url'
import styles from '@/styles.css?url'

type ResolvedHeaderLink = {
  id: string
  label: string
  href: string
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#f6f8fc' },
      { title: site.name },
      ...(!productConfig.indexingEnabled ? [{ name: 'robots', content: 'noindex,nofollow' }] : []),
      ...(publicEnv.googleSiteVerification
        ? [{ name: 'google-site-verification', content: publicEnv.googleSiteVerification }]
        : []),
    ],
    links: [
      { rel: 'stylesheet', href: styles },
      { rel: 'stylesheet', href: skinStyles },
      { rel: 'stylesheet', href: usabilityStyles },
      { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/favicon.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = localeFromPathname(pathname)
  const copy = shellMessages[locale]
  const localeAlternates = localeAlternatesForPath(pathname)
  const surfaceMode = surfaceModeForPath(pathname)
  const navigation = siteNavigationForMode(surfaceMode)

  const nav = resolveHeaderLinks(locale, navigation)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="ship-header" data-site-header data-product-surface-mode={surfaceMode}>
        <div className="ship-header-inner">
          <Brand locale={locale} />

          <nav className="ship-main-nav" aria-label={copy.primaryNavigation}>
            {nav.map((item) => (
              <a
                aria-current={isCurrentNavigation(pathname, item.href) ? 'page' : undefined}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ship-header-actions">
            <details className="ship-language-menu" data-language-menu>
              <summary aria-label={copy.languageSwitcher}>
                <Globe2 aria-hidden="true" />
                <span className="ship-language-current">{localeConfig[locale].label}</span>
                {localeAlternates.length > 0 && <ChevronDown aria-hidden="true" />}
              </summary>
              {localeAlternates.length > 0 ? (
                <div className="ship-language-popover">
                  {localeAlternates.map((alternate) => (
                    <a
                      aria-label={
                        locale === 'en'
                          ? `Switch to ${alternate.label}`
                          : locale === 'zh-CN'
                            ? `切换到${alternate.label}`
                            : `切換到${alternate.label}`
                      }
                      className="locale-switch"
                      data-locale-switch
                      href={alternate.path}
                      hrefLang={alternate.locale}
                      key={alternate.locale}
                      lang={alternate.locale}
                    >
                      <span>{alternate.label}</span>
                      <small>{alternate.shortLabel}</small>
                    </a>
                  ))}
                </div>
              ) : null}
            </details>

            <details className="ship-mobile-menu" data-mobile-menu>
              <summary aria-label={copy.mobileNavigation}>
                <Menu aria-hidden="true" />
                <span>{copy.mobileNavigation}</span>
              </summary>
              <nav aria-label={copy.primaryNavigation}>
                {nav.map((item) => (
                  <a
                    aria-current={isCurrentNavigation(pathname, item.href) ? 'page' : undefined}
                    href={item.href}
                    key={item.id}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <SiteFooter locale={locale} navigation={navigation} />
    </div>
  )
}

function resolveHeaderLinks(
  locale: Locale,
  navigation: SiteNavigationConfig,
): ResolvedHeaderLink[] {
  const standardLinks = navigation.header.links.flatMap((linkId) => {
    const resolved = resolveHeaderLink(linkId, locale, navigation)
    return resolved ? [resolved] : []
  })

  const customLinks = (navigation.header.customLinks ?? []).flatMap((link) => {
    const label = localizedNavigationValue(link.label, locale)
    const href = localizedNavigationValue(link.href, locale)
    return label && href ? [{ id: link.id, label, href }] : []
  })

  return [...standardLinks, ...customLinks]
}

function resolveHeaderLink(
  linkId: HeaderLinkId,
  locale: Locale,
  navigation: SiteNavigationConfig,
): ResolvedHeaderLink | undefined {
  const copy = shellMessages[locale]
  const homePath = localizedPathOrDefault('home', locale)

  switch (linkId) {
    case 'home':
      return { id: linkId, label: copy.nav.home, href: homePath }
    case 'tools': {
      const href = navigation.header.toolsHref
        ? localizedNavigationValue(navigation.header.toolsHref, locale)
        : undefined
      return href ? { id: linkId, label: copy.nav.tools, href } : undefined
    }
  }
}

function isCurrentNavigation(pathname: string, href: string): boolean {
  const target = href.split('#', 1)[0] || '/'
  const normalize = (value: string) => (value.length > 1 ? value.replace(/\/+$/, '') : value)

  const current = normalize(pathname)
  const normalizedTarget = normalize(target)
  return current === normalizedTarget
}

function Brand({ locale }: Readonly<{ locale: Locale }>) {
  const copy = shellMessages[locale]

  return (
    <a
      className="ship-brand"
      href={localizedPathOrDefault('home', locale)}
      aria-label={`${site.name} ${copy.nav.home}`}
    >
      <img className="ship-brand-icon" src="/favicon.png" alt="" width="36" height="36" />
      <span>{site.name}</span>
    </a>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = localeFromPathname(pathname)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: localeConfig[locale].htmlLang,
  }

  return (
    <html lang={localeConfig[locale].htmlLang}>
      <head>
        <HeadContent />
      </head>
      <body>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = localeFromPathname(pathname)
  const copy = shellMessages[locale].notFound

  return (
    <section className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {copy.kicker}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{copy.title}</h1>
        <a className="prototype-primary-link mt-7" href={localizedPathOrDefault('home', locale)}>
          {copy.returnHome}
        </a>
      </div>
    </section>
  )
}

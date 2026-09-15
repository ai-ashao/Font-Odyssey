export const localeConfig = {
  en: {
    htmlLang: 'en',
    label: 'English',
    shortLabel: 'EN',
    pathPrefix: '',
  },
  'zh-CN': {
    htmlLang: 'zh-CN',
    label: '简体中文',
    shortLabel: '简',
    pathPrefix: 'zh',
  },
  'zh-TW': {
    htmlLang: 'zh-TW',
    label: '繁體中文',
    shortLabel: '繁',
    pathPrefix: 'zh-tw',
  },
} as const

export type Locale = keyof typeof localeConfig

export const defaultLocale = 'en' satisfies Locale

// FontOdyssey is intentionally English-only for now. Keep the locale metadata above so
// additional markets can be re-enabled later without rebuilding the i18n foundation.
export const supportedLocales: ReadonlyArray<Locale> = ['en']

export function localeFromPathname(_pathname: string): Locale {
  return defaultLocale
}

import type { Locale } from '@/i18n/config'
import {
  type FontCatalogItem,
  type FontCategory,
  type FontLanguage,
  findFontBySlug,
  fontCatalog,
  fontLanguages,
} from './font-catalog'

export type FontHubId =
  | 'chinese'
  | 'japanese'
  | 'korean'
  | 'latin'
  | 'sans-serif'
  | 'serif'
  | 'handwriting'
  | 'monospace'
  | 'free-commercial'
  | 'variable-fonts'

type LocalizedHubCopy = {
  title: string
  description: string
  eyebrow: string
}

export type FontHubDefinition = {
  id: FontHubId
  type: 'language' | 'category' | 'collection'
  language?: FontLanguage
  category?: FontCategory
  localized: Record<Locale, LocalizedHubCopy>
  matches: (font: FontCatalogItem) => boolean
}

function localePrefix(locale: Locale): string {
  if (locale === 'zh-CN') return '/zh'
  if (locale === 'zh-TW') return '/zh-tw'
  return ''
}

function copy(
  en: LocalizedHubCopy,
  zhCN: LocalizedHubCopy,
  zhTW: LocalizedHubCopy,
): Record<Locale, LocalizedHubCopy> {
  return { en, 'zh-CN': zhCN, 'zh-TW': zhTW }
}

export const fontHubDefinitions: ReadonlyArray<FontHubDefinition> = [
  {
    id: 'chinese',
    type: 'language',
    language: 'Chinese',
    localized: copy(
      {
        eyebrow: 'LANGUAGE COLLECTION',
        title: 'Free Chinese Fonts',
        description:
          'Browse curated Simplified and Traditional Chinese fonts with clear licensing and language-support metadata.',
      },
      {
        eyebrow: '中文字体',
        title: '免费中文字体',
        description: '浏览精选简体与繁体中文字体，查看授权、字重、语言支持与官方来源。',
      },
      {
        eyebrow: '中文字體',
        title: '免費中文字體',
        description: '瀏覽精選簡體與繁體中文字體，查看授權、字重、語言支援與官方來源。',
      },
    ),
    matches: (font) => fontLanguages(font).includes('Chinese'),
  },
  {
    id: 'japanese',
    type: 'language',
    language: 'Japanese',
    localized: copy(
      {
        eyebrow: 'LANGUAGE COLLECTION',
        title: 'Free Japanese Fonts',
        description:
          'Explore curated Japanese font families for interface, editorial, presentation, and creative work.',
      },
      {
        eyebrow: '日文字体',
        title: '免费日文字体',
        description: '探索适合界面、排版、演示和创作的精选日文字体。',
      },
      {
        eyebrow: '日文字體',
        title: '免費日文字體',
        description: '探索適合介面、排版、簡報與創作的精選日文字體。',
      },
    ),
    matches: (font) => fontLanguages(font).includes('Japanese'),
  },
  {
    id: 'korean',
    type: 'language',
    language: 'Korean',
    localized: copy(
      {
        eyebrow: 'LANGUAGE COLLECTION',
        title: 'Free Korean Fonts',
        description:
          'Explore curated Hangul font families with clear license and source information.',
      },
      {
        eyebrow: '韩文字体',
        title: '免费韩文字体',
        description: '浏览精选韩文字体，并查看清晰的授权与官方来源信息。',
      },
      {
        eyebrow: '韓文字體',
        title: '免費韓文字體',
        description: '瀏覽精選韓文字體，並查看清楚的授權與官方來源資訊。',
      },
    ),
    matches: (font) => fontLanguages(font).includes('Korean'),
  },
  {
    id: 'latin',
    type: 'language',
    language: 'Latin',
    localized: copy(
      {
        eyebrow: 'LANGUAGE COLLECTION',
        title: 'Popular Latin Fonts',
        description:
          'Browse curated Latin sans, serif, display, handwriting, and monospace font families.',
      },
      {
        eyebrow: '拉丁字体',
        title: '热门拉丁字体',
        description: '浏览精选拉丁无衬线、衬线、展示、手写和等宽字体。',
      },
      {
        eyebrow: '拉丁字體',
        title: '熱門拉丁字體',
        description: '瀏覽精選拉丁無襯線、襯線、展示、手寫與等寬字體。',
      },
    ),
    matches: (font) => fontLanguages(font).includes('Latin'),
  },
  ...(
    [
      ['sans-serif', 'Sans Serif', 'Sans Serif Fonts', '无衬线字体', '無襯線字體'],
      ['serif', 'Serif', 'Serif Fonts', '衬线字体', '襯線字體'],
      ['handwriting', 'Handwriting', 'Handwriting Fonts', '手写字体', '手寫字體'],
      ['monospace', 'Monospace', 'Monospace Fonts', '等宽字体', '等寬字體'],
    ] as const
  ).map(([id, category, enTitle, cnTitle, twTitle]) => ({
    id,
    type: 'category' as const,
    category,
    localized: copy(
      {
        eyebrow: 'STYLE COLLECTION',
        title: enTitle,
        description: `Explore curated ${category.toLowerCase()} font families with verified licensing information.`,
      },
      {
        eyebrow: '字体风格',
        title: cnTitle,
        description: `探索精选${cnTitle}，查看授权、语言支持和字体样式信息。`,
      },
      {
        eyebrow: '字體風格',
        title: twTitle,
        description: `探索精選${twTitle}，查看授權、語言支援與字體樣式資訊。`,
      },
    ),
    matches: (font: FontCatalogItem) => font.category === category,
  })),
  {
    id: 'free-commercial',
    type: 'collection',
    localized: copy(
      {
        eyebrow: 'LICENSE COLLECTION',
        title: 'Free Fonts for Commercial Use',
        description:
          'Browse approved open-license font families and review the individual license before using a font in commercial work.',
      },
      {
        eyebrow: '商用字体',
        title: '免费商用字体',
        description: '浏览已通过许可门禁的开源字体；用于商业项目之前仍应查看每款字体的具体许可证。',
      },
      {
        eyebrow: '商用字體',
        title: '免費商用字體',
        description: '瀏覽已通過授權門檻的開源字體；用於商業專案前仍應查看每款字體的具體授權。',
      },
    ),
    matches: () => true,
  },
  {
    id: 'variable-fonts',
    type: 'collection',
    localized: copy(
      {
        eyebrow: 'FORMAT COLLECTION',
        title: 'Variable Fonts',
        description:
          'Discover variable font families with one or more adjustable axes and multiple styles.',
      },
      {
        eyebrow: '可变字体',
        title: '可变字体精选',
        description: '发现带有一个或多个可调轴、可覆盖多种样式的精选可变字体。',
      },
      {
        eyebrow: '可變字體',
        title: '可變字體精選',
        description: '探索帶有一個或多個可調軸、可涵蓋多種樣式的精選可變字體。',
      },
    ),
    matches: (font) => font.variableAxisCount > 0,
  },
]

const hubById = new Map(fontHubDefinitions.map((hub) => [hub.id, hub]))

export function findFontHub(id: string): FontHubDefinition | undefined {
  return hubById.get(id as FontHubId)
}

export function fontsForHub(hub: FontHubDefinition): FontCatalogItem[] {
  return fontCatalog.filter(hub.matches)
}

export function fontPath(font: FontCatalogItem | string, locale: Locale): string {
  const slug = typeof font === 'string' ? font : font.slug
  return `${localePrefix(locale)}/font/${slug}`
}

export function fontHubPath(hub: FontHubDefinition | FontHubId, locale: Locale): string {
  const id = typeof hub === 'string' ? hub : hub.id
  return `${localePrefix(locale)}/fonts/${id}`
}

export function fontDetailAlternates(font: FontCatalogItem) {
  return (['en', 'zh-CN', 'zh-TW'] as const).map((locale) => ({
    locale,
    path: fontPath(font, locale),
  }))
}

export function fontHubAlternates(hub: FontHubDefinition) {
  return (['en', 'zh-CN', 'zh-TW'] as const).map((locale) => ({
    locale,
    path: fontHubPath(hub, locale),
  }))
}

export function fontLocaleAlternatesForPath(
  pathname: string,
): Array<{ locale: Locale; path: string }> {
  const normalized = normalizePath(pathname)
  const parsed = parseLocalizedFontPath(normalized)
  if (parsed?.kind === 'font') {
    const font = findFontBySlug(parsed.value)
    if (!font) return []
    return fontDetailAlternates(font).filter((item) => item.locale !== parsed.locale)
  }
  if (parsed?.kind === 'hub') {
    const hub = findFontHub(parsed.value)
    if (!hub) return []
    return fontHubAlternates(hub).filter((item) => item.locale !== parsed.locale)
  }
  return []
}

export function fontSitemapPaths(): string[] {
  return [
    ...fontCatalog.flatMap((font) =>
      (['en', 'zh-CN', 'zh-TW'] as const).map((locale) => fontPath(font, locale)),
    ),
    ...fontHubDefinitions.flatMap((hub) =>
      (['en', 'zh-CN', 'zh-TW'] as const).map((locale) => fontHubPath(hub, locale)),
    ),
  ]
}

function parseLocalizedFontPath(
  pathname: string,
): { locale: Locale; kind: 'font' | 'hub'; value: string } | undefined {
  const parts = pathname.split('/').filter(Boolean)
  let locale: Locale = 'en'
  let offset = 0
  if (parts[0] === 'zh') {
    locale = 'zh-CN'
    offset = 1
  } else if (parts[0] === 'zh-tw') {
    locale = 'zh-TW'
    offset = 1
  }

  if (parts[offset] === 'font' && parts[offset + 1] && parts.length === offset + 2) {
    return { locale, kind: 'font', value: parts[offset + 1] }
  }
  if (parts[offset] === 'fonts' && parts[offset + 1] && parts.length === offset + 2) {
    return { locale, kind: 'hub', value: parts[offset + 1] }
  }
  return undefined
}

function normalizePath(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0] || '/'
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

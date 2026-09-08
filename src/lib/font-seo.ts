import type { Locale } from '@/i18n/config'
import type { FontCatalogItem } from './font-catalog'
import { publishedFontForLocale } from './font-publication'
import {
  type FontHubDefinition,
  fontDetailHreflangAlternates,
  fontHubAlternates,
  fontHubPath,
  fontPath,
} from './font-routes'
import { pageHead } from './seo'

export function fontDetailHead(font: FontCatalogItem | undefined, locale: Locale, slug: string) {
  if (!font) {
    return pageHead({
      title: locale === 'en' ? 'Font not found' : locale === 'zh-CN' ? '字体不存在' : '字體不存在',
      description: 'The requested font is not part of the current FontOdyssey catalog.',
      path: `${locale === 'zh-CN' ? '/zh' : locale === 'zh-TW' ? '/zh-tw' : ''}/font/${slug}`,
      indexable: false,
    })
  }

  const published = publishedFontForLocale(font.slug, locale)
  const editorial = published?.content[locale]

  const fallbackTitle =
    locale === 'en'
      ? `${font.family} Font — License & Language Support`
      : locale === 'zh-CN'
        ? `${font.family} 字体信息、授权与语言支持`
        : `${font.family} 字體資訊、授權與語言支援`
  const fallbackDescription =
    locale === 'en'
      ? `Review ${font.family} styles, ${font.license} licensing, measured language coverage, and upstream source information.`
      : locale === 'zh-CN'
        ? `查看 ${font.family} 的字体样式、${font.license} 许可证、实测语言覆盖率与上游来源。`
        : `查看 ${font.family} 的字體樣式、${font.license} 授權、實測語言覆蓋率與上游來源。`

  const hreflang = published ? fontDetailHreflangAlternates(font) : []
  const fallback = hreflang.find((alternate) => alternate.locale === 'en') ?? hreflang[0]
  const alternates =
    hreflang.length >= 2 && fallback
      ? [...hreflang, { locale: 'x-default', path: fallback.path }]
      : []

  return pageHead({
    title: editorial?.title ?? fallbackTitle,
    description: editorial?.description ?? fallbackDescription,
    path: fontPath(font, locale),
    alternates,
    indexable: Boolean(published),
  })
}

export function fontHubHead(hub: FontHubDefinition | undefined, locale: Locale, id: string) {
  if (!hub) {
    return pageHead({
      title: 'Font collection not found',
      description: 'The requested font collection does not exist.',
      path: `${locale === 'zh-CN' ? '/zh' : locale === 'zh-TW' ? '/zh-tw' : ''}/fonts/${id}`,
      indexable: false,
    })
  }
  const copy = hub.localized[locale]
  return pageHead({
    title: copy.title,
    description: copy.description,
    path: fontHubPath(hub, locale),
    alternates: [...fontHubAlternates(hub), { locale: 'x-default', path: fontHubPath(hub, 'en') }],
  })
}

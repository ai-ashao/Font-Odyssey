import type { Locale } from '@/i18n/config'
import type { FontCatalogItem } from './font-catalog'
import {
  type FontHubDefinition,
  fontDetailAlternates,
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

  const title =
    locale === 'en'
      ? `${font.family} Font Free Download`
      : locale === 'zh-CN'
        ? `${font.family} 字体免费下载与授权说明`
        : `${font.family} 字體免費下載與授權說明`
  const description =
    locale === 'en'
      ? `Preview ${font.family}, review ${font.styleCount} styles, ${font.license} licensing, language support, and verified source information before downloading.`
      : locale === 'zh-CN'
        ? `预览 ${font.family}，查看 ${font.styleCount} 种样式、${font.license} 许可证、语言支持与官方来源，再选择下载方式。`
        : `預覽 ${font.family}，查看 ${font.styleCount} 種樣式、${font.license} 授權、語言支援與官方來源，再選擇下載方式。`

  return pageHead({
    title,
    description,
    path: fontPath(font, locale),
    alternates: [
      ...fontDetailAlternates(font),
      { locale: 'x-default', path: fontPath(font, 'en') },
    ],
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

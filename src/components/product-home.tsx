import type { Locale } from '@/i18n/config'
import { localizedPageHead } from '@/lib/seo'
import { FontHome } from './font-home'

export function ProductHome({ locale }: Readonly<{ locale: Locale }>) {
  return <FontHome locale={locale} />
}

export function productHomeHead(locale: Locale) {
  const meta =
    locale === 'zh-CN'
      ? {
          title: '免费字体下载与商用字体精选',
          description:
            '探索 FontOdyssey 精选的热门中文、日文、韩文和拉丁字体，查看授权、语言支持、分类与字体详情。',
        }
      : locale === 'zh-TW'
        ? {
            title: '免費字體下載與商用字體精選',
            description:
              '探索 FontOdyssey 精選的熱門中文、日文、韓文與拉丁字體，查看授權、語言支援、分類與字體詳情。',
          }
        : {
            title: 'Free Fonts for Commercial Use',
            description:
              'Discover curated multilingual font downloads with clear licensing, language support, font details, and verified official sources.',
          }
  return localizedPageHead({
    pageId: 'home',
    locale,
    title: meta.title,
    description: meta.description,
  })
}

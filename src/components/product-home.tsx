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
          title: '免费字体下载与多语言字体精选',
          description:
            '探索 FontOdyssey 精选的中文、日文、韩文和拉丁字体下载，查看授权、语言支持、分类、字符覆盖与字体详情。',
        }
      : locale === 'zh-TW'
        ? {
            title: '免費字體下載與多語言字體精選',
            description:
              '探索 FontOdyssey 精選的中文、日文、韓文與拉丁字體下載，查看授權、語言支援、分類、字元覆蓋與字體詳情。',
          }
        : {
            title: 'Free Font Downloads — Curated Multilingual Fonts',
            description:
              'Browse curated multilingual font downloads with clear licensing, measured language coverage, verified sources, and detailed font pages.',
          }
  return localizedPageHead({
    pageId: 'home',
    locale,
    title: meta.title,
    description: meta.description,
  })
}

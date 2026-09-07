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
          title: '精选热门字体免费下载',
          description:
            '探索 FontOdyssey 精选的热门中文、日文、韩文和拉丁字体，按类别、语言和推荐度筛选。',
        }
      : {
          title: 'Curated Popular Font Downloads',
          description:
            'Explore a curated collection of popular Latin, Chinese, Japanese, and Korean fonts by category, language, and recommendation.',
        }
  return localizedPageHead({
    pageId: 'home',
    locale,
    title: meta.title,
    description: meta.description,
  })
}

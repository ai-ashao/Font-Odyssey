import { createFileRoute } from '@tanstack/react-router'
import { FontCatalogPage } from '@/components/font-catalog-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh/fonts/')({
  head: () =>
    localizedPageHead({
      pageId: 'fonts',
      locale: 'zh-CN',
      title: '浏览字体',
      description: '浏览 149 个精选字体，并按推荐度、热门程度、名称或样式数量排序。',
    }),
  component: () => <FontCatalogPage locale="zh-CN" />,
})

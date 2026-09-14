import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/components/about-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh/about')({
  head: () =>
    localizedPageHead({
      pageId: 'about',
      locale: 'zh-CN',
      title: '关于我们',
      description: '了解 FontOdyssey 如何审核字体来源、许可证、字符覆盖和发布完整性。',
    }),
  component: () => <AboutPage locale="zh-CN" />,
})

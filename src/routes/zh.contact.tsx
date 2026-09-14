import { createFileRoute } from '@tanstack/react-router'
import { ContactPage } from '@/components/contact-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh/contact')({
  head: () =>
    localizedPageHead({
      pageId: 'contact',
      locale: 'zh-CN',
      title: '联系我们',
      description: '联系 FontOdyssey，报告字体来源、许可证、元数据或下载问题。',
    }),
  component: () => <ContactPage locale="zh-CN" />,
})

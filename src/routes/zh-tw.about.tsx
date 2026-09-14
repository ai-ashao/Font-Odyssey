import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/components/about-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh-tw/about')({
  head: () =>
    localizedPageHead({
      pageId: 'about',
      locale: 'zh-TW',
      title: '關於我們',
      description: '了解 FontOdyssey 如何審核字體來源、授權、字元涵蓋與發布完整性。',
    }),
  component: () => <AboutPage locale="zh-TW" />,
})

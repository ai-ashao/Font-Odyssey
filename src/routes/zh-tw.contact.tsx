import { createFileRoute } from '@tanstack/react-router'
import { ContactPage } from '@/components/contact-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh-tw/contact')({
  head: () =>
    localizedPageHead({
      pageId: 'contact',
      locale: 'zh-TW',
      title: '聯絡我們',
      description: '聯絡 FontOdyssey，回報字體來源、授權、中繼資料或下載問題。',
    }),
  component: () => <ContactPage locale="zh-TW" />,
})

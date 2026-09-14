import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/components/about-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    localizedPageHead({
      pageId: 'about',
      locale: 'en',
      title: 'About Us',
      description:
        'Learn how FontOdyssey reviews font sources, licenses, character coverage, and release integrity.',
    }),
  component: () => <AboutPage locale="en" />,
})

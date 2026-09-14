import { createFileRoute } from '@tanstack/react-router'
import { ContactPage } from '@/components/contact-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/contact')({
  head: () =>
    localizedPageHead({
      pageId: 'contact',
      locale: 'en',
      title: 'Contact',
      description: 'Contact FontOdyssey about font sources, licenses, metadata, or downloads.',
    }),
  component: () => <ContactPage locale="en" />,
})

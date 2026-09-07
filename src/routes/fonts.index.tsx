import { createFileRoute } from '@tanstack/react-router'
import { FontCatalogPage } from '@/components/font-catalog-page'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/fonts/')({
  head: () =>
    localizedPageHead({
      pageId: 'fonts',
      locale: 'en',
      title: 'Browse Fonts',
      description:
        'Browse 149 curated font families and sort by recommendation, popularity, name, or style count.',
    }),
  component: () => <FontCatalogPage locale="en" />,
})

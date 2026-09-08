import { createFileRoute, notFound } from '@tanstack/react-router'
import { FontDetailPage } from '@/components/font-detail-page'
import { fontDetailPath, getEligiblePublishedFont } from '@/lib/font-publishing-registry'
import { pageHead } from '@/lib/seo'

export const Route = createFileRoute('/fonts/$slug')({
  loader: ({ params }) => {
    const font = getEligiblePublishedFont(params.slug, 'en')
    if (!font) throw notFound()
    return font
  },
  head: ({ loaderData }) => {
    const content = loaderData?.content.en
    if (!loaderData || !content) {
      return pageHead({
        title: 'Font not available',
        description: 'This font page is not available.',
        path: '/fonts',
        indexable: false,
      })
    }
    return pageHead({
      title: content.title,
      description: content.description,
      path: fontDetailPath(loaderData.facts.slug, 'en'),
      indexable: true,
    })
  },
  component: FontDetailRoute,
})

function FontDetailRoute() {
  return <FontDetailPage font={Route.useLoaderData()} locale="en" />
}

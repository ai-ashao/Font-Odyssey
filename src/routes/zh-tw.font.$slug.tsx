import { createFileRoute } from '@tanstack/react-router'
import { FontDetailPage } from '@/components/font-detail-page'
import { findFontBySlug } from '@/lib/font-catalog'
import { fontDetailHead } from '@/lib/font-seo'

export const Route = createFileRoute('/zh-tw/font/$slug')({
  head: ({ params }) => fontDetailHead(findFontBySlug(params.slug), 'zh-TW', params.slug),
  component: FontPage,
})

function FontPage() {
  const { slug } = Route.useParams()
  return <FontDetailPage font={findFontBySlug(slug)} locale="zh-TW" />
}

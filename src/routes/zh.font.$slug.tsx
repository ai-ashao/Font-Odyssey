import { createFileRoute } from '@tanstack/react-router'
import { FontDetailPage } from '@/components/font-detail-page'
import { findFontBySlug } from '@/lib/font-catalog'
import { fontDetailModelForLocale } from '@/lib/font-publication'
import { fontDetailHead } from '@/lib/font-seo'

export const Route = createFileRoute('/zh/font/$slug')({
  head: ({ params }) => fontDetailHead(findFontBySlug(params.slug), 'zh-CN', params.slug),
  component: FontPage,
})

function FontPage() {
  const { slug } = Route.useParams()
  return <FontDetailPage font={fontDetailModelForLocale(slug, 'zh-CN')} locale="zh-CN" />
}

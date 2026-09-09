import { createFileRoute, notFound } from '@tanstack/react-router'
import { FontHubPage } from '@/components/font-hub-page'
import { findFontHub } from '@/lib/font-routes'
import { fontHubHead } from '@/lib/font-seo'

export const Route = createFileRoute('/zh-tw/fonts/$hub')({
  loader: ({ params }) => {
    if (!findFontHub(params.hub)) throw notFound()
  },
  head: ({ params }) => fontHubHead(findFontHub(params.hub), 'zh-TW', params.hub),
  component: HubPage,
})

function HubPage() {
  const { hub } = Route.useParams()
  return <FontHubPage hub={findFontHub(hub)} locale="zh-TW" />
}

import { createFileRoute } from '@tanstack/react-router'
import { FontHubPage } from '@/components/font-hub-page'
import { findFontHub } from '@/lib/font-routes'
import { fontHubHead } from '@/lib/font-seo'

export const Route = createFileRoute('/fonts/$hub')({
  head: ({ params }) => fontHubHead(findFontHub(params.hub), 'en', params.hub),
  component: HubPage,
})

function HubPage() {
  const { hub } = Route.useParams()
  return <FontHubPage hub={findFontHub(hub)} locale="en" />
}

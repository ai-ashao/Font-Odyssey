import { createFileRoute } from '@tanstack/react-router'
import { FontCatalogPage } from '@/components/font-catalog-page'
import { hasActiveFontDirectorySearch, parseFontDirectorySearch } from '@/lib/font-directory-search'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/fonts/')({
  validateSearch: parseFontDirectorySearch,
  head: ({ match }) =>
    localizedPageHead({
      pageId: 'fonts',
      locale: 'en',
      title: 'Browse Fonts',
      description:
        'Browse 149 curated font families and sort by recommendation, popularity, name, or style count.',
      robots: hasActiveFontDirectorySearch(match.search) ? 'noindex,follow' : undefined,
    }),
  component: FontCatalogRoute,
})

function FontCatalogRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <FontCatalogPage
      locale="en"
      onSearchChange={(next) => void navigate({ search: next, replace: true })}
      search={search}
    />
  )
}

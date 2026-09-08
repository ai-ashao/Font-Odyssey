import { createFileRoute } from '@tanstack/react-router'
import { FontCatalogPage } from '@/components/font-catalog-page'
import { hasActiveFontDirectorySearch, parseFontDirectorySearch } from '@/lib/font-directory-search'
import { localizedPageHead } from '@/lib/seo'

export const Route = createFileRoute('/zh-tw/fonts/')({
  validateSearch: parseFontDirectorySearch,
  head: ({ match }) =>
    localizedPageHead({
      pageId: 'fonts',
      locale: 'zh-TW',
      title: '瀏覽字體',
      description: '瀏覽 149 個精選字體，並依推薦度、熱門程度、名稱或樣式數量排序。',
      robots: hasActiveFontDirectorySearch(match.search) ? 'noindex,follow' : undefined,
    }),
  component: FontCatalogRoute,
})

function FontCatalogRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <FontCatalogPage
      locale="zh-TW"
      onSearchChange={(next) => void navigate({ search: next, replace: true })}
      search={search}
    />
  )
}

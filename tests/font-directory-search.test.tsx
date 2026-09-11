import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontCatalogPage } from '@/components/font-catalog-page'
import { hasActiveFontDirectorySearch, parseFontDirectorySearch } from '@/lib/font-directory-search'
import { localizedPageHead } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

describe('font directory search contract', () => {
  it('keeps only supported, normalized parameters', () => {
    expect(
      parseFontDirectorySearch({
        q: '  Noto  ',
        category: 'Serif',
        language: 'Chinese',
        sort: 'popular',
        unexpected: 'value',
      }),
    ).toEqual({ q: 'Noto', category: 'Serif', language: 'Chinese', sort: 'popular' })

    expect(
      parseFontDirectorySearch({
        q: ['Inter'],
        category: 'Rounded',
        language: 'Unknown',
        sort: 'featured',
      }),
    ).toEqual({})
  })

  it('renders filtered catalog results during SSR', () => {
    const html = renderToStaticMarkup(
      <FontCatalogPage locale="en" search={{ language: 'Chinese' }} />,
    )

    expect(html.match(/data-font-card=/g)).toHaveLength(11)
    expect(html).toContain('11 fonts')
    expect(html).toContain('<option value="Chinese" selected="">Chinese</option>')
  })

  it('marks faceted pages noindex,follow while keeping the directory canonical', () => {
    const search = parseFontDirectorySearch({ q: 'Inter' })
    const head = localizedPageHead({
      pageId: 'fonts',
      locale: 'en',
      title: 'Browse Fonts',
      description: 'Browse the curated font directory.',
      robots: hasActiveFontDirectorySearch(search) ? 'noindex,follow' : undefined,
    })

    expect(head.meta).toContainEqual({ name: 'robots', content: 'noindex,follow' })
    expect(head.links).toContainEqual({
      rel: 'canonical',
      href: absoluteUrl('/fonts'),
    })
  })
})

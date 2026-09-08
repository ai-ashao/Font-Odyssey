import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontDetailPage } from '@/components/font-detail-page'
import { fontCatalog } from '@/lib/font-catalog'
import type { FontAssetRelease, PublishedFont } from '@/lib/font-publishing'
import {
  fontDetailPath,
  fontDetailRoutes,
  fontDetailSitemapPaths,
  getEligiblePublishedFont,
} from '@/lib/font-publishing-registry'
import { fontEditorialContent } from '@/modules/font-editorial-content'

const sha256 = 'a'.repeat(64)

describe('font detail publishing boundary', () => {
  it('keeps draft pages out of the public registry and sitemap', () => {
    expect(fontEditorialContent).toHaveLength(5)
    expect(fontEditorialContent.every((content) => content.contentStatus === 'draft')).toBe(true)
    expect(getEligiblePublishedFont('inter', 'en')).toBeUndefined()
    expect(fontDetailRoutes()).toEqual([])
    expect(fontDetailSitemapPaths()).toEqual([])
  })

  it('uses stable localized detail paths', () => {
    expect(fontDetailPath('inter', 'en')).toBe('/fonts/inter')
    expect(fontDetailPath('inter', 'zh-CN')).toBe('/zh/fonts/inter')
    expect(fontDetailPath('inter', 'zh-TW')).toBe('/zh-tw/fonts/inter')
  })

  it('renders the specimen and verified download controls from composed data', () => {
    const facts = fontCatalog.find((font) => font.slug === 'inter')
    const draft = fontEditorialContent.find((content) => content.slug === 'inter')
    expect(facts).toBeDefined()
    expect(draft).toBeDefined()
    if (!facts || !draft) throw new Error('Missing Inter test fixtures.')
    const release: FontAssetRelease = {
      slug: 'inter',
      releaseVersion: '5e35378e-example1',
      sourceCommit: facts.sourceCommit,
      package: {
        url: 'https://assets.example/fonts/inter/inter.zip',
        sha256,
        bytes: 100,
        contentType: 'application/zip',
      },
      license: {
        url: 'https://assets.example/fonts/inter/OFL.txt',
        sha256,
        bytes: 100,
        contentType: 'text/plain; charset=utf-8',
      },
      preview: {
        url: 'https://assets.example/fonts/inter/preview.woff2',
        sha256,
        bytes: 100,
        contentType: 'font/woff2',
      },
      previewStatus: 'GENERATED_SUBSET',
      status: 'VERIFIED',
      verifiedAt: '2026-09-07T00:00:00Z',
    }
    const ready = { ...draft, contentStatus: 'ready' as const, reviewedAt: '2026-09-07T00:00:00Z' }
    const font: PublishedFont = { facts, release, content: { en: ready } }
    const html = renderToStaticMarkup(<FontDetailPage font={font} locale="en" />)
    expect(html).toContain('data-font-detail="inter"')
    expect(html).toContain('Live specimen')
    expect(html).toContain('Loading preview font')
    expect(html).toContain('Download ZIP')
    expect(html).toContain('5e35378e-example1')
  })
})

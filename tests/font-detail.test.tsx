import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontDetailPage } from '@/components/font-detail-page'
import { fontCatalog } from '@/lib/font-catalog'
import { publishedFontForLocale } from '@/lib/font-publication'
import type { FontAssetRelease, PublishedFont } from '@/lib/font-publishing'
import { fontPath, fontSitemapPaths } from '@/lib/font-routes'
import {
  buildFontEditorialSnapshot,
  fontEditorialContentFor,
} from '@/modules/font-editorial-content'

const sha256 = 'a'.repeat(64)

describe('font detail publishing boundary', () => {
  it('provides ready factual content for every catalog family in all three locales', () => {
    const editorial = buildFontEditorialSnapshot()
    expect(editorial).toHaveLength(fontCatalog.length * 3)
    expect(editorial.every((content) => content.contentStatus === 'ready')).toBe(true)
    expect(publishedFontForLocale('inter', 'en')).toBeDefined()
    expect(fontSitemapPaths()).toContain('/font/inter')
    expect(fontSitemapPaths()).toContain('/zh/font/inter')
    expect(fontSitemapPaths()).toContain('/zh-tw/font/inter')
  })

  it('uses stable localized detail paths', () => {
    expect(fontPath('inter', 'en')).toBe('/font/inter')
    expect(fontPath('inter', 'zh-CN')).toBe('/zh/font/inter')
    expect(fontPath('inter', 'zh-TW')).toBe('/zh-tw/font/inter')
  })

  it('renders the specimen and verified download controls from composed data', () => {
    const facts = fontCatalog.find((font) => font.slug === 'inter')
    expect(facts).toBeDefined()
    if (!facts) throw new Error('Missing Inter test fixture.')

    const content = fontEditorialContentFor(facts, 'en')
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
    const font: PublishedFont = { facts, release, content: { en: content } }
    const html = renderToStaticMarkup(<FontDetailPage font={font} locale="en" />)

    expect(html).toContain('data-font-detail="inter"')
    expect(html).toContain('Live specimen')
    expect(html).toContain('Loading preview font')
    expect(html).toContain('Download font')
    expect(html).toContain('https://assets.example/fonts/inter/inter.zip')
    expect(html).toContain('5e35378e-example1')
  })
})

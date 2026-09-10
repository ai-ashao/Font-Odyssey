import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontCard } from '@/components/font-card'
import { findFontBySlug } from '@/lib/font-catalog'

describe('font card preview loading', () => {
  it('SSR renders the font link without eagerly embedding a preview font-face', () => {
    const inter = findFontBySlug('inter')
    expect(inter).toBeDefined()
    if (!inter) return

    const html = renderToStaticMarkup(<FontCard font={inter} locale="en" />)
    expect(html).toContain('href="/font/inter"')
    expect(html).not.toContain('@font-face')
    expect(html).not.toContain('assets.fontodyssey.com')
  })
})

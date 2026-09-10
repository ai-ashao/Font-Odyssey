import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontHome } from '@/components/font-home'
import { productHomeHead } from '@/components/product-home'

describe('SEO-first font homepage', () => {
  it('renders broad font-download intent and real catalog hub links in initial HTML', () => {
    const html = renderToStaticMarkup(<FontHome locale="en" />)

    expect(html).toContain('Free Font Downloads — Curated Multilingual Fonts</h1>')
    expect(html).toContain('name="q"')
    expect(html).toContain('/fonts/chinese')
    expect(html).toContain('/fonts/sans-serif')
    expect(html).toContain('/fonts/display')
    expect(html).toContain('Are all FontOdyssey fonts free for commercial use?')
    expect(html).toContain('Verified download availability')
  })

  it('keeps Chinese content localized behind the shared component', () => {
    const html = renderToStaticMarkup(<FontHome locale="zh-CN" />)

    expect(html).toContain('免费字体下载与多语言字体精选</h1>')
    expect(html).toContain('action="/zh/fonts"')
    expect(html).toContain('/zh/fonts/chinese')
    expect(html).toContain('/zh/fonts/display')
    expect(html).toContain('所有 FontOdyssey 字体都可以免费商用吗？')
  })

  it('keeps homepage metadata on broad download intent instead of commercial-use intent', () => {
    const head = productHomeHead('en')
    expect(head.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Free Font Downloads — Curated Multilingual Fonts · FontOdyssey',
        }),
        expect.objectContaining({ name: 'description' }),
      ]),
    )
  })
})

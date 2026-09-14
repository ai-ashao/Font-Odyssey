import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FontHubPage } from '@/components/font-hub-page'
import { findFontHub } from '@/lib/font-routes'
import { fontHubEditorialContent } from '@/modules/font-hub-editorial-content'

describe('font hub editorial content', () => {
  it('publishes useful content for the four priority hubs in every locale', () => {
    for (const hubId of ['chinese', 'sans-serif', 'free-commercial', 'variable-fonts'] as const) {
      for (const locale of ['en', 'zh-CN', 'zh-TW'] as const) {
        const content = fontHubEditorialContent(hubId, locale)
        expect(content?.introduction.length).toBeGreaterThan(60)
        expect(content?.guidance).toHaveLength(3)
        expect(content?.faq).toHaveLength(2)
      }
    }
  })

  it('renders editorial guidance after the font inventory', () => {
    const html = renderToStaticMarkup(<FontHubPage hub={findFontHub('chinese')} locale="en" />)
    expect(html.indexOf('data-font-card')).toBeLessThan(
      html.indexOf('How to choose a Chinese font'),
    )
    expect(html).toContain('Chinese font questions')
    expect(html).toContain('Reserved Font Name')
  })

  it('does not manufacture generic editorial sections for every hub', () => {
    expect(fontHubEditorialContent('handwriting', 'en')).toBeUndefined()
  })
})

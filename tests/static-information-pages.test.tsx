import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AboutPage } from '@/components/about-page'
import { ContactPage } from '@/components/contact-page'
import { legalProfile } from '@/modules/legal-profile'

describe('localized information pages', () => {
  it('renders equivalent trust sections in all three locales', () => {
    const english = renderToStaticMarkup(<AboutPage locale="en" />)
    const simplified = renderToStaticMarkup(<AboutPage locale="zh-CN" />)
    const traditional = renderToStaticMarkup(<AboutPage locale="zh-TW" />)

    expect(english).toContain('Download integrity')
    expect(simplified).toContain('下载完整性')
    expect(traditional).toContain('下載完整性')
    expect(
      [english, simplified, traditional].map((html) => (html.match(/<h2/g) ?? []).length),
    ).toEqual([5, 5, 5])
  })

  it('localizes contact guidance and the return route', () => {
    const simplified = renderToStaticMarkup(<ContactPage locale="zh-CN" />)
    expect(simplified).toContain(legalProfile.contactEmail)
    expect(simplified).toContain('返回 FontOdyssey')
    expect(simplified).toContain('href="/zh"')
  })
})

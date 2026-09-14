import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { pageHead } from '@/lib/seo'
import { site } from '@/lib/site'

describe('page head social metadata', () => {
  it('uses the shared OG image unless a page supplies its own image', () => {
    const defaultHead = pageHead({ title: 'Fonts', description: 'Browse fonts.', path: '/fonts' })
    const customHead = pageHead({
      title: 'Fonts',
      description: 'Browse fonts.',
      path: '/fonts',
      socialImage: '/custom.png',
    })

    expect(defaultHead.meta).toEqual(
      expect.arrayContaining([
        { property: 'og:image', content: `${site.url}/og-default.png` },
        { name: 'twitter:image', content: `${site.url}/og-default.png` },
      ]),
    )
    expect(customHead.meta).toContainEqual({
      property: 'og:image',
      content: `${site.url}/custom.png`,
    })
  })

  it('ships the default OG image at the social-card dimensions', () => {
    const image = readFileSync(new URL('../public/og-default.png', import.meta.url))

    expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
    expect(image.readUInt32BE(16)).toBe(1200)
    expect(image.readUInt32BE(20)).toBe(630)
  })
})

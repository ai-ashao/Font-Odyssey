import { describe, expect, it } from 'vitest'
import { fontCatalog } from '@/lib/font-catalog'
import { validateEditorialContent } from '@/lib/font-publishing'
import {
  buildFontEditorialSnapshot,
  fontEditorialContentFor,
} from '@/modules/font-editorial-content'

const locales = ['en', 'zh-CN', 'zh-TW'] as const

describe('generated factual font editorial baseline', () => {
  it('provides one ready record per catalog family and locale', () => {
    const content = buildFontEditorialSnapshot()
    expect(content).toHaveLength(fontCatalog.length * locales.length)

    const identities = content.map((item) => `${item.slug}:${item.locale}`)
    expect(new Set(identities).size).toBe(identities.length)

    for (const font of fontCatalog) {
      for (const locale of locales) {
        const item = fontEditorialContentFor(font, locale)
        expect(item.contentStatus).toBe('ready')
        expect(item.title).toContain(font.family)
        expect(item.h1).toContain(font.family)
        expect(validateEditorialContent(item)).toEqual([])
      }
    }
  })

  it('keeps generated copy grounded in verified catalog facts', () => {
    const inter = fontCatalog.find((font) => font.slug === 'inter')
    expect(inter).toBeDefined()
    if (!inter) return

    const content = fontEditorialContentFor(inter, 'en')
    expect(content.description).toContain(inter.license)
    expect(content.intro).toContain(String(inter.styleCount))
    expect(content.about.join(' ')).toContain(inter.license)
    expect(content.about.join(' ').replaceAll(',', '')).toContain(
      String(inter.unicodeCodepointUnion),
    )
  })
})

import { describe, expect, it } from 'vitest'
import { fontCatalog } from '@/lib/font-catalog'
import { validateEditorialContent } from '@/lib/font-publishing'
import {
  buildFontEditorialSnapshot,
  fontEditorialContentFor,
} from '@/modules/font-editorial-content'

const locales = ['en', 'zh-CN', 'zh-TW'] as const

const previewCopy = {
  en: {
    live: 'verified live preview',
    rfn: 'Reserved Font Name preview restrictions',
  },
  'zh-CN': {
    live: '可用在线预览',
    rfn: '保留字体名称导致的预览限制',
  },
  'zh-TW': {
    live: '可用線上預覽',
    rfn: '保留字體名稱造成的預覽限制',
  },
} as const

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
    expect(content.about.join(' ')).toContain(inter.license)
    expect(content.about.join(' ').replaceAll(',', '')).toContain(
      String(inter.unicodeCodepointUnion),
    )
  })

  it('never claims a live preview when the release policy says one is unavailable', () => {
    for (const font of fontCatalog) {
      for (const locale of locales) {
        const content = fontEditorialContentFor(font, locale)
        const copy = previewCopy[locale]

        if (
          font.previewStatus === 'GENERATED_SUBSET' ||
          font.previewStatus === 'ORIGINAL_UNMODIFIED_WEBFONT'
        ) {
          expect(content.description).toContain(copy.live)
        } else {
          expect(content.description).not.toContain(copy.live)
        }

        if (font.previewStatus === 'UNAVAILABLE_RFN') {
          expect(content.description).toContain(copy.rfn)
        }
      }
    }
  })

  it('keeps the reviewed Pilot copy as a quality override above the factual baseline', () => {
    const inter = fontCatalog.find((font) => font.slug === 'inter')
    const raleway = fontCatalog.find((font) => font.slug === 'raleway')
    expect(inter).toBeDefined()
    expect(raleway).toBeDefined()
    if (!inter || !raleway) return

    const interContent = fontEditorialContentFor(inter, 'en')
    expect(interContent.intro).toContain('screen')
    expect(interContent.previewText).toBe('Sphinx of black quartz, judge my vow.')
    expect(interContent.about.length).toBeGreaterThanOrEqual(3)

    const ralewayContent = fontEditorialContentFor(raleway, 'en')
    expect(ralewayContent.previewText).toBe('Waltz, bad nymph, for quick jigs vex.')
    if (raleway.previewStatus === 'UNAVAILABLE_RFN') {
      expect(ralewayContent.description).toContain('Reserved Font Name')
      expect(ralewayContent.description).not.toContain('verified live preview')
    }
  })
})

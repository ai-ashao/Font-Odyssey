import { describe, expect, it } from 'vitest'
import { findFontBySlug } from '@/lib/font-catalog'
import { relatedFontsFor, relatedHubIdsFor } from '@/lib/font-related'

describe('related font graph', () => {
  it('returns deterministic alternatives without the source font', () => {
    const inter = findFontBySlug('inter')
    expect(inter).toBeDefined()
    if (!inter) throw new Error('Missing Inter fixture.')

    const first = relatedFontsFor(inter, 4)
    const second = relatedFontsFor(inter, 4)
    expect(first).toHaveLength(4)
    expect(first.map((font) => font.slug)).toEqual(second.map((font) => font.slug))
    expect(first.some((font) => font.slug === inter.slug)).toBe(false)
    expect(first.some((font) => font.category === inter.category)).toBe(true)
  })

  it('links each font into useful collection hubs', () => {
    const inter = findFontBySlug('inter')
    expect(inter).toBeDefined()
    if (!inter) throw new Error('Missing Inter fixture.')

    const hubs = relatedHubIdsFor(inter)
    expect(hubs).toContain('sans-serif')
    expect(hubs).toContain('latin')
    expect(hubs).toContain('free-commercial')
    expect(hubs).toContain('variable-fonts')
  })
})

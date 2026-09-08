import { describe, expect, it } from 'vitest'
import { fontOfficialSourceUrl } from '@/lib/font-assets'
import { fontCatalog } from '@/lib/font-catalog'

describe('font asset source links', () => {
  it('uses the pinned upstream source as evidence instead of a search results page', () => {
    const font = fontCatalog[0]
    expect(font).toBeDefined()
    if (!font) return

    expect(fontOfficialSourceUrl(font)).toBe(
      `https://github.com/google/fonts/tree/${font.sourceCommit}/${font.sourcePath}`,
    )
  })
})

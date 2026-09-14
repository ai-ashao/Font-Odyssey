import { describe, expect, it } from 'vitest'
import { canonicalRedirectUrl, isCanonicalHttpsUrl } from '@/lib/canonical-host'

describe('production canonical host', () => {
  it('redirects HTTP and www requests while preserving the path and query', () => {
    expect(canonicalRedirectUrl('http://fontodyssey.com/fonts?q=Inter')).toBe(
      'https://fontodyssey.com/fonts?q=Inter',
    )
    expect(canonicalRedirectUrl('https://www.fontodyssey.com/zh/font/inter?ref=nav')).toBe(
      'https://fontodyssey.com/zh/font/inter?ref=nav',
    )
  })

  it('leaves canonical production, preview and local hosts unchanged', () => {
    expect(canonicalRedirectUrl('https://fontodyssey.com/font/inter')).toBeUndefined()
    expect(
      canonicalRedirectUrl('https://font-odyssey.wangshao0713.workers.dev/font/inter'),
    ).toBeUndefined()
    expect(canonicalRedirectUrl('http://127.0.0.1:4173/font/inter')).toBeUndefined()
  })

  it('only treats the HTTPS apex as canonical', () => {
    expect(isCanonicalHttpsUrl('https://fontodyssey.com/')).toBe(true)
    expect(isCanonicalHttpsUrl('http://fontodyssey.com/')).toBe(false)
    expect(isCanonicalHttpsUrl('https://www.fontodyssey.com/')).toBe(false)
  })
})

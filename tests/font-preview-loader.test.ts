import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFontPreview } from '@/lib/font-preview-loader'

let id = 0
let instances: Array<{ resolve: () => void; reject: () => void }>
let added: ReturnType<typeof vi.fn>
const url = () => `https://assets.fontodyssey.com/fonts/fixture/test-${++id}/preview.woff2`
const sha = 'a'.repeat(64)

beforeEach(() => {
  vi.useFakeTimers()
  instances = []
  added = vi.fn()
  vi.stubGlobal('document', { fonts: { add: added } })
  vi.stubGlobal(
    'FontFace',
    class {
      load() {
        return new Promise((resolve, reject) => {
          instances.push({
            resolve: () => resolve(this),
            reject: () => reject(new Error('Fixture error')),
          })
        })
      }
    },
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('shared preview retries', () => {
  it('shares in-flight work even when another caller asks to retry', async () => {
    const target = url()
    const first = loadFontPreview(target, sha)
    expect(loadFontPreview(target, sha, true)).toBe(first)
    expect(instances).toHaveLength(1)
    instances[0].resolve()
    await first
    expect(added).toHaveBeenCalledTimes(1)
  })

  it('never replaces a successfully cached FontFace on retry', async () => {
    const target = url()
    const first = loadFontPreview(target, sha)
    instances[0].resolve()
    await first
    expect(loadFontPreview(target, sha, true)).toBe(first)
    expect(instances).toHaveLength(1)
  })

  it('caches errors but coalesces simultaneous explicit retries', async () => {
    const target = url()
    const first = loadFontPreview(target, sha)
    const failed = expect(first).rejects.toThrow('Fixture error')
    instances[0].reject()
    await failed
    expect(loadFontPreview(target, sha)).toBe(first)
    const retry = loadFontPreview(target, sha, true)
    expect(retry).not.toBe(first)
    expect(loadFontPreview(target, sha, true)).toBe(retry)
    expect(instances).toHaveLength(2)
    instances[1].resolve()
    await retry
    expect(added).toHaveBeenCalledTimes(1)
  })

  it('does not register a late result after timeout', async () => {
    const target = url()
    const first = loadFontPreview(target, sha)
    const failed = expect(first).rejects.toThrow('timed out')
    await vi.advanceTimersByTimeAsync(12000)
    await failed
    instances[0].resolve()
    await Promise.resolve()
    expect(added).not.toHaveBeenCalled()
    const retry = loadFontPreview(target, sha, true)
    instances[1].resolve()
    await retry
    expect(added).toHaveBeenCalledTimes(1)
  })

  it('clears timers when FontFace.load throws synchronously', async () => {
    vi.stubGlobal(
      'FontFace',
      class {
        load() {
          throw new Error('Synchronous failure')
        }
      },
    )
    await expect(loadFontPreview(url(), sha)).rejects.toThrow('Synchronous failure')
    expect(vi.getTimerCount()).toBe(0)
  })
})

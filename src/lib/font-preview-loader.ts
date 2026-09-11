/** Browser-only loader. Only a failed entry can be retried; pending and ready entries are shared. */
export type LoadedPreview = { family: string; face: FontFace }
type CachedPreview = {
  status: 'pending' | 'ready' | 'error'
  promise: Promise<LoadedPreview>
}
const cache = new Map<string, CachedPreview>()
const TIMEOUT_MS = 12000

export function loadFontPreview(
  url: string,
  sha256: string,
  retry = false,
): Promise<LoadedPreview> {
  const key = `${url}#${sha256}`
  const existing = cache.get(key)
  if (existing && (!retry || existing.status !== 'error')) return existing.promise

  const promise = new Promise<LoadedPreview>((resolve, reject) => {
    if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) {
      reject(new Error('FontFace API unavailable'))
      return
    }
    const family = `FontOdysseyPreview-${sha256}`
    let settled = false
    const timer = setTimeout(() => {
      settled = true
      reject(new Error('Preview timed out'))
    }, TIMEOUT_MS)
    let face: FontFace
    try {
      face = new FontFace(family, `url(${JSON.stringify(url)})`, { display: 'swap' })
      void face.load().then(
        (loaded) => {
          clearTimeout(timer)
          if (settled) return
          settled = true
          try {
            document.fonts.add(loaded)
            resolve({ family, face: loaded })
          } catch (error) {
            reject(error)
          }
        },
        (error: unknown) => {
          clearTimeout(timer)
          if (settled) return
          settled = true
          reject(error)
        },
      )
    } catch (error) {
      clearTimeout(timer)
      settled = true
      reject(error)
    }
  })
  const entry: CachedPreview = { status: 'pending', promise }
  cache.set(key, entry)
  // Both handlers settle locally and return nothing; do not create an unhandled rejecting chain.
  void promise.then(
    () => {
      entry.status = 'ready'
    },
    () => {
      entry.status = 'error'
    },
  )
  return promise
}

const productionHost = 'fontodyssey.com'
const productionHosts = new Set([productionHost, `www.${productionHost}`])

export function canonicalRedirectUrl(requestUrl: string): string | undefined {
  const url = new URL(requestUrl)
  if (!productionHosts.has(url.hostname)) return undefined
  if (url.protocol === 'https:' && url.hostname === productionHost) return undefined

  url.protocol = 'https:'
  url.hostname = productionHost
  url.port = ''
  return url.toString()
}

export function isCanonicalHttpsUrl(requestUrl: string): boolean {
  const url = new URL(requestUrl)
  return url.protocol === 'https:' && url.hostname === productionHost
}

export type PublicEnv = {
  siteUrl: string
  ga4Id?: string
  googleSiteVerification?: string
  fontAssetBaseUrl?: string
}

function parseOptionalHttpUrl(value: string | undefined, field: string): string | undefined {
  const raw = value?.trim()
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol')
    return url.toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${field} must be an absolute http(s) URL.`)
  }
}

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const rawSiteUrl = source.VITE_SITE_URL?.trim() || 'http://localhost:3000'
  let siteUrl: string
  try {
    const url = new URL(rawSiteUrl)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol')
    siteUrl = url.toString().replace(/\/$/, '')
  } catch {
    throw new Error('VITE_SITE_URL must be an absolute http(s) URL.')
  }

  const ga4Id = source.VITE_GA4_ID?.trim() || undefined
  if (ga4Id && !/^G-[A-Z0-9]+$/.test(ga4Id)) {
    throw new Error('VITE_GA4_ID must look like G-XXXXXXXXXX.')
  }

  return {
    siteUrl,
    ga4Id,
    googleSiteVerification: source.VITE_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    fontAssetBaseUrl: parseOptionalHttpUrl(
      source.VITE_FONT_ASSET_BASE_URL,
      'VITE_FONT_ASSET_BASE_URL',
    ),
  }
}

export const publicEnv = parsePublicEnv(import.meta.env)

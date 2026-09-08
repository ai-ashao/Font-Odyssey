export type NetdiskCtaMode = 'standard' | 'fast'

export type FontDownloadOverrideLink = {
  url: string
  verifiedAt: string
  ctaMode?: NetdiskCtaMode
}

export type FontDownloadOverride = {
  quark?: FontDownloadOverrideLink
  baidu?: FontDownloadOverrideLink
}

export type FontDownloadOverrideMap = Record<string, FontDownloadOverride>

/**
 * Add only real, verified affiliate/share URLs here.
 *
 * `ctaMode: 'fast'` is an explicit experience claim. Use it only after the current link has been
 * verified to provide the faster/convenient flow implied by the CTA copy. Otherwise omit ctaMode
 * or use `standard`.
 *
 * R2 package and preview URLs are deliberately not configurable here. They are rendered only from
 * VERIFIED asset releases after remote readback succeeds.
 */
export const fontDownloadOverrides: FontDownloadOverrideMap = {}

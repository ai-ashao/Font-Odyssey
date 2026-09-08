export type FontDownloadOverride = {
  quark?: string
  baidu?: string
}

export type FontDownloadOverrideMap = Record<string, FontDownloadOverride>

/**
 * Add only real, verified affiliate/share URLs here.
 *
 * R2 package and preview URLs are deliberately not configurable here. They are rendered only from
 * VERIFIED asset releases after remote readback succeeds.
 */
export const fontDownloadOverrides: FontDownloadOverrideMap = {}

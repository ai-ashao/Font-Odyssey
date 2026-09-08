export type FontDownloadOverride = {
  quark?: string
  baidu?: string
  r2?: string
  preview?: string
}

export type FontDownloadOverrideMap = Record<string, FontDownloadOverride>

/**
 * Add real, verified per-font download URLs here.
 *
 * Do not add placeholders. The UI only renders a provider when a real URL exists.
 */
export const fontDownloadOverrides: FontDownloadOverrideMap = {}

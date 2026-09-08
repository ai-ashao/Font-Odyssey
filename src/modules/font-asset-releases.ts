import type { FontAssetRelease } from '@/lib/font-publishing'

// Intentionally empty until versioned R2 objects pass remote readback.
// Local packaging manifests must never be copied here as VERIFIED releases.
export const fontAssetReleases: ReadonlyArray<FontAssetRelease> = []

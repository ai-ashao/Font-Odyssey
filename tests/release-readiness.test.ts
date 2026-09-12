import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('release readiness diagnostics', () => {
  it('audits Latin-only previews using subset metadata', () => {
    const output = execFileSync(process.execPath, ['scripts/release-readiness.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    const report = JSON.parse(output) as {
      blockers: string[]
      latinPreviewable: number
      latinPreviewReady: number
    }
    const latinBlockers = report.blockers.filter((blocker) =>
      blocker.includes('Latin preview is missing'),
    )

    expect(report.latinPreviewable).toBeGreaterThan(0)
    expect(latinBlockers).toHaveLength(report.latinPreviewable - report.latinPreviewReady)
  })
})

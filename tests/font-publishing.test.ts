import { describe, expect, it } from 'vitest'
import type {
  FontApprovalFacts,
  FontAssetRelease,
  FontEditorialContent,
  PublishedFont,
} from '@/lib/font-publishing'
import {
  fontPageEligibilityIssues,
  fontPageEligible,
  isCompliantPreview,
  validateApprovalCatalog,
  validateAssetRelease,
  validateEditorialContent,
} from '@/lib/font-publishing'

const sha256 = 'a'.repeat(64)

const facts: FontApprovalFacts = {
  curationRank: 1,
  family: 'Example Sans',
  slug: 'examplesans',
  category: 'Sans Serif',
  languageGroup: 'Latin',
  subsets: ['latin'],
  officialPopularityRank: 1,
  styleCount: 2,
  variableAxisCount: 1,
  fontFileCount: 2,
  parsedFontFileCount: 2,
  variableFontCount: 2,
  sourcePath: 'ofl/examplesans',
  sourceCommit: 'b'.repeat(40),
  license: 'OFL-1.1',
  licenseSha256Verified: true,
  reservedFontNames: [],
  axes: ['wght'],
  glyphCountMax: 500,
  unicodeCodepointUnion: 450,
  coverage: { latin: 1, zhCN: 0, zhTW: 0, japanese: 0, korean: 0, cjkUnified: 0 },
  packagingStatus: 'STANDARD',
  previewStatus: 'GENERATED_SUBSET',
  finalStatus: 'APPROVED',
}

const release: FontAssetRelease = {
  slug: facts.slug,
  releaseVersion: 'bbbbbbbb-aaaaaaaa',
  sourceCommit: facts.sourceCommit,
  package: {
    url: 'https://assets.example/fonts.zip',
    sha256,
    bytes: 100,
    contentType: 'application/zip',
  },
  license: { url: 'https://assets.example/OFL.txt', sha256, bytes: 100, contentType: 'text/plain' },
  preview: {
    url: 'https://assets.example/preview.woff2',
    sha256,
    bytes: 100,
    contentType: 'font/woff2',
  },
  previewStatus: 'GENERATED_SUBSET',
  status: 'VERIFIED',
  verifiedAt: '2026-09-07T00:00:00Z',
}

const content: FontEditorialContent = {
  pageId: `font:${facts.slug}`,
  slug: facts.slug,
  locale: 'en',
  contentStatus: 'ready',
  title: 'Example Sans font',
  description: 'Download and preview Example Sans.',
  h1: 'Example Sans',
  intro: 'A clear sans serif for interfaces.',
  about: ['Example Sans is designed for readable interfaces.'],
  useCases: ['Interfaces'],
  previewText: 'Sphinx of black quartz, judge my vow.',
  reviewedAt: '2026-09-07T00:00:00Z',
}

function published(overrides: Partial<PublishedFont> = {}): PublishedFont {
  return { facts, release, content: { en: content }, ...overrides }
}

describe('font publishing contracts', () => {
  it('accepts a complete approved catalog and rejects duplicate identities', () => {
    expect(validateApprovalCatalog([facts])).toEqual([])
    expect(validateApprovalCatalog([facts, facts])).toEqual([
      'examplesans: duplicate slug.',
      '1: duplicate curationRank.',
    ])
  })

  it('requires every evidence layer before a locale page is eligible', () => {
    expect(validateAssetRelease(release)).toEqual([])
    expect(validateEditorialContent(content)).toEqual([])
    expect(fontPageEligible(published(), 'en')).toBe(true)
    expect(fontPageEligible(published(), 'zh-CN')).toBe(false)
    expect(fontPageEligibilityIssues(published(), 'zh-CN')).toContain('zh-CN content is not ready.')
  })

  it('blocks generated subsets for Reserved Font Name families', () => {
    const reservedFacts = { ...facts, reservedFontNames: ['Example Sans'] }
    expect(isCompliantPreview(reservedFacts, release.previewStatus, release.preview)).toBe(false)
    expect(fontPageEligible(published({ facts: reservedFacts }), 'en')).toBe(false)
  })

  it('allows an original unmodified preview for Reserved Font Name families', () => {
    const reservedFacts: FontApprovalFacts = {
      ...facts,
      reservedFontNames: ['Example Sans'],
      previewStatus: 'ORIGINAL_UNMODIFIED_WEBFONT',
    }
    expect(isCompliantPreview(reservedFacts, 'ORIGINAL_UNMODIFIED_WEBFONT', release.preview)).toBe(
      true,
    )
  })

  it('rejects mismatched asset and content identities', () => {
    const mismatchedRelease = { ...release, sourceCommit: 'c'.repeat(40) }
    const mismatchedContent = { ...content, pageId: 'font:other' as const }
    const issues = fontPageEligibilityIssues(
      published({ release: mismatchedRelease, content: { en: mismatchedContent } }),
      'en',
    )
    expect(issues).toEqual(
      expect.arrayContaining([
        'Asset release sourceCommit does not match approval facts.',
        'en content identity does not match approval facts.',
      ]),
    )
  })

  it('rejects unverified asset shapes and unreviewed ready content', () => {
    expect(validateAssetRelease({ ...release, verifiedAt: 'yesterday' })).toContain(
      'Asset release verifiedAt is invalid.',
    )
    expect(validateEditorialContent({ ...content, reviewedAt: undefined })).toContain(
      'Ready editorial content requires reviewedAt.',
    )
  })
})

import publishingSchema from '@/data/font-publishing.schema.json'

export type PublishingLocale = 'en' | 'zh-CN' | 'zh-TW'
export type ContentStatus = 'draft' | 'ready'
export type PreviewStatus =
  | 'ELIGIBLE_NOT_GENERATED'
  | 'GENERATED_SUBSET'
  | 'ORIGINAL_UNMODIFIED_WEBFONT'
  | 'UNAVAILABLE_RFN'

export type FontCoverage = {
  latin: number
  zhCN: number
  zhTW: number
  japanese: number
  korean: number
  cjkUnified: number
}

export type FontApprovalFacts = {
  curationRank: number
  family: string
  slug: string
  category: 'Sans Serif' | 'Serif' | 'Display' | 'Handwriting' | 'Monospace'
  languageGroup: string
  subsets: string[]
  officialPopularityRank: number
  styleCount: number
  variableAxisCount: number
  fontFileCount: number
  parsedFontFileCount: number
  variableFontCount: number
  sourcePath: string
  sourceCommit: string
  license: 'OFL-1.1' | 'Apache-2.0' | 'UFL-1.0'
  licenseSha256Verified: true
  reservedFontNames: string[]
  axes: string[]
  glyphCountMax: number
  unicodeCodepointUnion: number
  coverage: FontCoverage
  packagingStatus: string
  previewStatus: PreviewStatus
  finalStatus: 'APPROVED'
}

export type VerifiedObject = {
  url: string
  sha256: string
  bytes: number
  contentType: string
  etag?: string
}

export type FontAssetRelease = {
  slug: string
  releaseVersion: string
  sourceCommit: string
  package: VerifiedObject
  license: VerifiedObject
  preview?: VerifiedObject
  previewStatus: PreviewStatus
  status: 'VERIFIED'
  verifiedAt: string
}

export type FontEditorialContent = {
  pageId: `font:${string}`
  slug: string
  locale: PublishingLocale
  contentStatus: ContentStatus
  title: string
  description: string
  h1: string
  intro: string
  about: string[]
  useCases: string[]
  previewText: string
  reviewedAt?: string
}

export type PublishedFont = {
  facts: FontApprovalFacts
  release: FontAssetRelease
  content: Partial<Record<PublishingLocale, FontEditorialContent>>
}

const previewStatuses = new Set<string>(publishingSchema.$defs.previewStatus.enum)
const categories = new Set<string>(
  publishingSchema.$defs.fontApprovalFacts.properties.category.enum,
)
const licenses = new Set<string>(publishingSchema.$defs.fontApprovalFacts.properties.license.enum)
const approvalFields = new Set<string>(publishingSchema.$defs.fontApprovalFacts.required)
const publishingLocales = new Set<string>(
  publishingSchema.$defs.fontEditorialContent.properties.locale.enum,
)
const contentStatuses = new Set<string>(
  publishingSchema.$defs.fontEditorialContent.properties.contentStatus.enum,
)

export function validateApprovalFacts(value: unknown): string[] {
  if (!isRecord(value)) return ['Font approval facts must be an object.']
  const issues: string[] = []
  const label = typeof value.family === 'string' ? value.family : 'Font'
  const fields = Object.keys(value)

  for (const field of approvalFields) {
    if (!(field in value)) issues.push(`${label}: missing ${field}.`)
  }
  for (const field of fields) {
    if (!approvalFields.has(field)) issues.push(`${label}: unexpected ${field}.`)
  }

  if (value.finalStatus !== 'APPROVED') issues.push(`${label}: finalStatus must be APPROVED.`)
  if (value.licenseSha256Verified !== true)
    issues.push(`${label}: license checksum is not verified.`)
  if (!isPositiveInteger(value.curationRank))
    issues.push(`${label}: curationRank must be positive.`)
  if (!isNonEmptyString(value.slug) || !/^[a-z0-9]+$/.test(value.slug)) {
    issues.push(`${label}: slug is invalid.`)
  }
  if (!isNonEmptyString(value.sourceCommit) || !/^[0-9a-f]{40}$/.test(value.sourceCommit)) {
    issues.push(`${label}: sourceCommit must be a full Git SHA.`)
  }
  if (!previewStatuses.has(String(value.previewStatus))) {
    issues.push(`${label}: previewStatus is not in the shared schema.`)
  }
  if (!categories.has(String(value.category))) issues.push(`${label}: category is invalid.`)
  if (!licenses.has(String(value.license))) issues.push(`${label}: license is invalid.`)
  if (!isNonEmptyString(value.family)) issues.push(`${label}: family is required.`)
  if (!isNonEmptyString(value.languageGroup)) issues.push(`${label}: languageGroup is required.`)
  if (!isNonEmptyString(value.sourcePath)) issues.push(`${label}: sourcePath is required.`)
  if (!isNonEmptyString(value.packagingStatus))
    issues.push(`${label}: packagingStatus is required.`)
  if (!isPositiveInteger(value.officialPopularityRank)) {
    issues.push(`${label}: officialPopularityRank must be positive.`)
  }
  if (!isPositiveInteger(value.styleCount)) issues.push(`${label}: styleCount must be positive.`)
  if (!isNonNegativeInteger(value.variableAxisCount)) {
    issues.push(`${label}: variableAxisCount must be non-negative.`)
  }
  if (!isPositiveInteger(value.fontFileCount))
    issues.push(`${label}: fontFileCount must be positive.`)
  if (!isPositiveInteger(value.parsedFontFileCount)) {
    issues.push(`${label}: parsedFontFileCount must be positive.`)
  }
  if (!isNonNegativeInteger(value.variableFontCount)) {
    issues.push(`${label}: variableFontCount must be non-negative.`)
  }
  if (!isPositiveInteger(value.glyphCountMax))
    issues.push(`${label}: glyphCountMax must be positive.`)
  if (!isPositiveInteger(value.unicodeCodepointUnion)) {
    issues.push(`${label}: unicodeCodepointUnion must be positive.`)
  }
  if (!isStringArray(value.subsets)) issues.push(`${label}: subsets must be a string array.`)
  if (!isStringArray(value.axes)) issues.push(`${label}: axes must be a string array.`)
  if (!isStringArray(value.reservedFontNames)) {
    issues.push(`${label}: reservedFontNames must be a string array.`)
  }
  if (
    value.previewStatus === 'UNAVAILABLE_RFN' &&
    Array.isArray(value.reservedFontNames) &&
    value.reservedFontNames.length === 0
  ) {
    issues.push(`${label}: UNAVAILABLE_RFN requires a Reserved Font Name.`)
  }
  if (!isCoverage(value.coverage)) issues.push(`${label}: coverage is invalid.`)

  return issues
}

export function validateApprovalCatalog(values: ReadonlyArray<unknown>): string[] {
  const issues = values.flatMap(validateApprovalFacts)
  const slugs = new Set<string>()
  const ranks = new Set<number>()
  for (const value of values) {
    if (!isRecord(value)) continue
    if (typeof value.slug === 'string') {
      if (slugs.has(value.slug)) issues.push(`${value.slug}: duplicate slug.`)
      slugs.add(value.slug)
    }
    if (typeof value.curationRank === 'number') {
      if (ranks.has(value.curationRank))
        issues.push(`${value.curationRank}: duplicate curationRank.`)
      ranks.add(value.curationRank)
    }
  }
  return issues
}

export function isCompliantPreview(
  facts: FontApprovalFacts,
  previewStatus: PreviewStatus,
  preview: VerifiedObject | undefined,
): boolean {
  if (!preview) return false
  if (previewStatus === 'GENERATED_SUBSET') return facts.reservedFontNames.length === 0
  return previewStatus === 'ORIGINAL_UNMODIFIED_WEBFONT'
}

export function validateAssetRelease(release: FontAssetRelease): string[] {
  const issues: string[] = []
  if (release.status !== 'VERIFIED') issues.push('Asset release is not VERIFIED.')
  if (!isNonEmptyString(release.releaseVersion)) issues.push('Asset release version is missing.')
  if (!/^[0-9a-f]{40}$/.test(release.sourceCommit)) {
    issues.push('Asset release sourceCommit must be a full Git SHA.')
  }
  if (!isIsoDateTime(release.verifiedAt)) issues.push('Asset release verifiedAt is invalid.')
  if (
    !isVerifiedHttpsObject(release.package) ||
    release.package.contentType !== 'application/zip'
  ) {
    issues.push('Download package is not a verified ZIP object.')
  }
  if (!isVerifiedHttpsObject(release.license) || !release.license.contentType.startsWith('text/')) {
    issues.push('License is not a verified text object.')
  }
  if (
    release.preview &&
    (!isVerifiedHttpsObject(release.preview) || release.preview.contentType !== 'font/woff2')
  ) {
    issues.push('Preview is not a verified WOFF2 object.')
  }
  if (!previewStatuses.has(release.previewStatus)) {
    issues.push('Asset release previewStatus is invalid.')
  }
  const previewRequired =
    release.previewStatus === 'GENERATED_SUBSET' ||
    release.previewStatus === 'ORIGINAL_UNMODIFIED_WEBFONT'
  if (previewRequired && !release.preview) {
    issues.push(`${release.previewStatus} releases require a verified preview object.`)
  }
  if (!previewRequired && release.preview) {
    issues.push(`${release.previewStatus} releases cannot include a preview object.`)
  }
  return issues
}

export function validateEditorialContent(content: FontEditorialContent): string[] {
  const issues: string[] = []
  if (!publishingLocales.has(content.locale)) issues.push('Editorial locale is invalid.')
  if (!contentStatuses.has(content.contentStatus))
    issues.push('Editorial contentStatus is invalid.')
  if (content.pageId !== `font:${content.slug}`)
    issues.push('Editorial pageId does not match its slug.')
  for (const [field, value] of [
    ['title', content.title],
    ['description', content.description],
    ['h1', content.h1],
    ['intro', content.intro],
    ['previewText', content.previewText],
  ]) {
    if (!isNonEmptyString(value)) issues.push(`Editorial ${field} is required.`)
  }
  if (!isNonEmptyStringArray(content.about)) issues.push('Editorial about content is required.')
  if (!isNonEmptyStringArray(content.useCases)) issues.push('Editorial use cases are required.')
  if (content.contentStatus === 'ready' && !content.reviewedAt) {
    issues.push('Ready editorial content requires reviewedAt.')
  } else if (content.reviewedAt && !isIsoDateTime(content.reviewedAt)) {
    issues.push('Editorial reviewedAt is invalid.')
  }
  return issues
}

export function fontPageEligibilityIssues(font: PublishedFont, locale: PublishingLocale): string[] {
  const issues = validateApprovalFacts(font.facts)
  issues.push(...validateAssetRelease(font.release))
  if (font.release.slug !== font.facts.slug)
    issues.push('Asset release slug does not match approval facts.')
  if (font.release.sourceCommit !== font.facts.sourceCommit) {
    issues.push('Asset release sourceCommit does not match approval facts.')
  }
  const content = font.content[locale]
  if (!content || content.contentStatus !== 'ready') issues.push(`${locale} content is not ready.`)
  if (content) {
    issues.push(...validateEditorialContent(content))
    if (
      content.locale !== locale ||
      content.slug !== font.facts.slug ||
      content.pageId !== `font:${font.facts.slug}`
    ) {
      issues.push(`${locale} content identity does not match approval facts.`)
    }
  }
  return issues
}

export function fontPageEligible(font: PublishedFont, locale: PublishingLocale): boolean {
  return fontPageEligibilityIssues(font, locale).length === 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString)
}

function isCoverage(value: unknown): value is FontCoverage {
  if (!isRecord(value)) return false
  return ['latin', 'zhCN', 'zhTW', 'japanese', 'korean', 'cjkUnified'].every((key) => {
    const coverage = value[key]
    return typeof coverage === 'number' && coverage >= 0 && coverage <= 1
  })
}

function isVerifiedHttpsObject(value: VerifiedObject): boolean {
  let validUrl = false
  try {
    validUrl = new URL(value.url).protocol === 'https:'
  } catch {
    validUrl = false
  }
  return (
    validUrl &&
    /^[0-9a-f]{64}$/.test(value.sha256) &&
    Number.isInteger(value.bytes) &&
    value.bytes > 0 &&
    value.contentType.length > 0
  )
}

function isIsoDateTime(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  )
}

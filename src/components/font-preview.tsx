import { useEffect, useId, useMemo, useRef, useState } from 'react'
import previewIndex from '@/data/font-preview-coverage.json'
import type { Locale } from '@/i18n/config'
import {
  codepointLabel,
  missingPreviewCharacters,
  packagedSample,
  previewEvidence,
} from '@/lib/font-preview-contract'
import { loadFontPreview } from '@/lib/font-preview-loader'
import { verifiedAssetReleaseForSlug } from '@/lib/font-publication'
import type { FontApprovalFacts, FontAssetRelease } from '@/lib/font-publishing'

type Props = { font: FontApprovalFacts; locale: Locale; release?: FontAssetRelease }
const labels = {
  en: {
    title: 'Live specimen',
    input: 'Preview text',
    size: 'Preview size',
    reset: 'Reset sample',
    retry: 'Retry preview',
    pending: 'Loading preview font when visible…',
    loading: 'Loading preview font…',
    ready: 'Preview font loaded',
    failed: 'Preview could not load. Download is still available below.',
    unavailable:
      'No web preview for this release. View the font details or download the original files.',
    rfn: 'This release has no web preview under the current Reserved Font Name policy. Original downloads are available.',
    unknown:
      'Character coverage has not been verified for this preview file. The sample is hidden to avoid displaying a system font as this font.',
    subset: 'This web preview is a small subset, not the complete download.',
    missing: 'Not in this preview subset',
    fallback:
      'Highlighted characters are shown in a system font. The full download may still contain them.',
    empty: 'Enter text to compare the letterforms.',
    note: 'Your text stays in this page.',
    supported: 'All entered characters are present in this preview file.',
  },
  'zh-CN': {
    title: '在线预览',
    input: '预览文字',
    size: '预览字号',
    reset: '恢复样张',
    retry: '重试预览',
    pending: '进入可视区域后加载预览',
    loading: '正在加载预览字体…',
    ready: '预览字体已加载',
    failed: '预览加载失败，下方仍可下载原始字体。',
    unavailable: '此版本暂无网页预览，可查看字体信息或下载原始文件。',
    rfn: '此版本按当前保留字体名称策略不提供网页预览，原始字体仍可下载。',
    unknown: '当前预览文件的字符范围尚未核验。为避免把系统字体当作此字体，暂不显示样张。',
    subset: '网页预览仅包含少量字符，不代表下载包的完整字库。',
    missing: '不在当前预览子集中的字符',
    fallback: '标记的字符使用系统字体显示；完整下载包可能仍包含这些字。',
    empty: '输入文字以比较字形。',
    note: '输入的文字仅保留在当前页面。',
    supported: '当前输入的字符均包含在此预览文件中。',
  },
  'zh-TW': {
    title: '線上預覽',
    input: '預覽文字',
    size: '預覽字級',
    reset: '恢復樣張',
    retry: '重試預覽',
    pending: '進入可視區域後載入預覽',
    loading: '正在載入預覽字體…',
    ready: '預覽字體已載入',
    failed: '預覽載入失敗，下方仍可下載原始字體。',
    unavailable: '此版本暫無網頁預覽，可查看字體資訊或下載原始檔案。',
    rfn: '此版本依目前保留字體名稱策略不提供網頁預覽，原始字體仍可下載。',
    unknown: '目前預覽檔的字元範圍尚未核驗。為避免把系統字體當作此字體，暫不顯示樣張。',
    subset: '網頁預覽只包含少量字元，不代表下載包的完整字庫。',
    missing: '不在目前預覽子集中的字元',
    fallback: '標記的字元使用系統字體顯示；完整下載包可能仍包含這些字。',
    empty: '輸入文字以比較字形。',
    note: '輸入的文字只保留在目前頁面。',
    supported: '目前輸入的字元均包含在此預覽檔中。',
  },
} as const

function usePreview(font: FontApprovalFacts, supplied?: FontAssetRelease) {
  const ref = useRef<HTMLDivElement | null>(null)
  const release = supplied ?? verifiedAssetReleaseForSlug(font.slug)
  const object =
    release && ['GENERATED_SUBSET', 'ORIGINAL_UNMODIFIED_WEBFONT'].includes(release.previewStatus)
      ? release.preview
      : undefined
  const url = object?.url
  const sha256 = object?.sha256
  const [active, setActive] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<{ key: string; family: string }>()
  const [failedKey, setFailedKey] = useState<string>()
  const key = object ? `${object.url}#${object.sha256}#${attempt}` : ''
  const evidence = useMemo(() => previewEvidence(previewIndex, release), [release])

  useEffect(() => {
    const node = ref.current
    if (!url || !node) return
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: '160px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [url])

  useEffect(() => {
    if (!active || !url || !sha256) return
    let cancelled = false
    void loadFontPreview(url, sha256, attempt > 0).then(
      (result) => {
        if (!cancelled) setLoaded({ key, family: result.family })
      },
      () => {
        if (!cancelled) setFailedKey(key)
      },
    )
    return () => {
      cancelled = true
    }
  }, [active, url, sha256, attempt, key])

  const state = !object
    ? 'unavailable'
    : failedKey === key
      ? 'error'
      : loaded?.key === key
        ? 'ready'
        : active
          ? 'loading'
          : 'pending'
  return {
    ref,
    state,
    evidence,
    family: loaded?.key === key ? loaded.family : undefined,
    release,
    retry: () => setAttempt((value) => value + 1),
  }
}

function SampleText({
  text,
  family,
  missing,
}: {
  text: string
  family: string
  missing: string[]
}) {
  const missingSet = new Set(missing)
  // Preserve shaping and kerning within each supported run, rather than wrapping every glyph.
  const runs: Array<{ text: string; missing: boolean; start: number }> = []
  let offset = 0
  for (const char of text) {
    const absent = missingSet.has(char)
    const previous = runs[runs.length - 1]
    if (previous && previous.missing === absent) previous.text += char
    else runs.push({ text: char, missing: absent, start: offset })
    offset += char.length
  }
  return (
    <span style={{ fontFamily: `"${family}"` }}>
      {runs.map((run) => (
        <span
          key={run.start}
          className={run.missing ? 'fo-preview-missing' : undefined}
          title={run.missing ? [...run.text].map(codepointLabel).join(' ') : undefined}
        >
          {run.text}
        </span>
      ))}
    </span>
  )
}

export function FontCardPreview({ font, locale, release, text }: Props & { text?: string }) {
  const preview = usePreview(font, release)
  const copy = labels[locale]
  const sample = text ?? preview.evidence?.defaultText ?? packagedSample(font)
  const missing = preview.evidence
    ? missingPreviewCharacters(sample, preview.evidence.codepoints)
    : []
  const canShow = preview.state === 'ready' && preview.evidence && preview.family
  const cardStatus =
    locale === 'en'
      ? {
          unavailable: 'Web preview unavailable',
          failed: 'Preview could not load',
          unknown: 'Preview awaiting character verification',
        }
      : locale === 'zh-CN'
        ? {
            unavailable: '此版本暂无网页预览',
            failed: '预览加载失败',
            unknown: '预览字形范围待核验',
          }
        : {
            unavailable: '此版本暫無網頁預覽',
            failed: '預覽載入失敗',
            unknown: '預覽字形範圍待核驗',
          }
  return (
    <div
      ref={preview.ref}
      className="fo-card-preview"
      data-preview-state={preview.state}
      data-preview-evidence={preview.evidence ? 'verified' : 'missing'}
    >
      {canShow ? (
        <p className="fo-card-sample">
          <SampleText text={sample} family={preview.family as string} missing={missing} />
        </p>
      ) : (
        <p className="fo-card-placeholder">
          {preview.state === 'unavailable'
            ? cardStatus.unavailable
            : preview.state === 'error'
              ? cardStatus.failed
              : preview.state === 'ready'
                ? cardStatus.unknown
                : preview.state === 'loading'
                  ? copy.loading
                  : copy.pending}
        </p>
      )}
      {canShow && missing.length > 0 ? (
        <p className="fo-preview-notice">
          {copy.missing}: {missing.slice(0, 8).map(codepointLabel).join(', ')}. {copy.fallback}
        </p>
      ) : null}
    </div>
  )
}

export function FontSpecimen({
  font,
  locale,
  release,
  compact = false,
  onTextChange,
}: Props & { compact?: boolean; onTextChange?: (text: string | undefined) => void }) {
  const preview = usePreview(font, release)
  const copy = labels[locale]
  const id = useId()
  const [draft, setDraft] = useState<string>()
  const [size, setSize] = useState(compact ? 38 : 64)
  const [editing, setEditing] = useState(!compact)
  const editLabel =
    locale === 'en'
      ? editing
        ? 'Done'
        : 'Edit sample'
      : locale === 'zh-CN'
        ? editing
          ? '收起编辑'
          : '试试自己的文字'
        : editing
          ? '收起編輯'
          : '試試自己的文字'
  const sample = draft ?? preview.evidence?.defaultText ?? packagedSample(font)
  const missing = preview.evidence
    ? missingPreviewCharacters(sample, preview.evidence.codepoints)
    : []
  const canShow = preview.state === 'ready' && preview.evidence && preview.family
  const available = preview.state !== 'unavailable'
  const status =
    preview.state === 'ready'
      ? copy.ready
      : preview.state === 'error'
        ? copy.failed
        : preview.state === 'unavailable'
          ? preview.release?.previewStatus === 'UNAVAILABLE_RFN'
            ? copy.rfn
            : copy.unavailable
          : preview.state === 'loading'
            ? copy.loading
            : copy.pending
  return (
    <div
      className={`fo-specimen${compact ? ' fo-specimen-compact' : ''}`}
      ref={preview.ref}
      data-preview-state={preview.state}
      data-preview-evidence={preview.evidence ? 'verified' : 'missing'}
    >
      <div className="fo-specimen-header">
        <div>
          <p className="font-detail-kicker">
            {copy.title} · {font.family}
          </p>
          <p className="fo-preview-status" aria-live="polite">
            {status}
          </p>
        </div>
        {compact && available ? (
          <button
            className="fo-secondary-button"
            type="button"
            aria-expanded={editing}
            aria-controls={`${id}-controls`}
            onClick={() => setEditing((value) => !value)}
          >
            {editLabel}
          </button>
        ) : null}
        {preview.state === 'error' ? (
          <button className="fo-secondary-button" type="button" onClick={preview.retry}>
            {copy.retry}
          </button>
        ) : null}
      </div>
      {available ? (
        <>
          <div className="fo-specimen-controls" id={`${id}-controls`} hidden={!editing}>
            <label className="fo-preview-input-label" htmlFor={`${id}-text`}>
              {copy.input}
              <input
                id={`${id}-text`}
                aria-describedby={`${id}-notice`}
                maxLength={140}
                autoComplete="off"
                spellCheck={false}
                value={sample}
                disabled={!preview.evidence}
                onChange={(event) => {
                  setDraft(event.currentTarget.value)
                  onTextChange?.(event.currentTarget.value)
                }}
              />
            </label>
            <label className="fo-preview-size-label" htmlFor={`${id}-size`}>
              {copy.size} · {size}px
              <input
                id={`${id}-size`}
                type="range"
                min={24}
                max={112}
                value={size}
                onChange={(event) => setSize(Number(event.currentTarget.value))}
              />
            </label>
            <button
              className="fo-secondary-button"
              type="button"
              onClick={() => {
                setDraft(undefined)
                onTextChange?.(undefined)
              }}
            >
              {copy.reset}
            </button>
          </div>
          <div className="fo-specimen-output" style={{ fontSize: `${size}px` }}>
            {canShow ? (
              sample ? (
                <SampleText text={sample} family={preview.family as string} missing={missing} />
              ) : (
                <span className="fo-sample-placeholder">{copy.empty}</span>
              )
            ) : (
              <span className="fo-sample-placeholder">
                {preview.state === 'ready' ? copy.unknown : status}
              </span>
            )}
          </div>
          <p
            className="fo-preview-notice"
            hidden={compact && !editing && Boolean(preview.evidence) && missing.length === 0}
            id={`${id}-notice`}
            aria-live="polite"
          >
            {!preview.evidence
              ? copy.unknown
              : missing.length
                ? `${copy.missing}: ${missing.slice(0, 12).map(codepointLabel).join(', ')}${missing.length > 12 ? '…' : ''}. ${copy.fallback}`
                : sample
                  ? copy.supported
                  : copy.empty}
          </p>
          <p className="fo-preview-footnote">
            {preview.release?.previewStatus === 'GENERATED_SUBSET' ? copy.subset : ''}{' '}
            {!compact || editing ? copy.note : ''}
          </p>
        </>
      ) : null}
    </div>
  )
}

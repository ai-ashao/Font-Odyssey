import type { Locale } from '@/i18n/config'
import { fontCatalog } from '@/lib/font-catalog'
import type { FontApprovalFacts, FontEditorialContent } from '@/lib/font-publishing'

const reviewedAt = '2026-09-09T15:00:00Z'
const locales = ['en', 'zh-CN', 'zh-TW'] as const satisfies ReadonlyArray<Locale>

const categoryUseCases: Record<
  FontApprovalFacts['category'],
  Record<Locale, ReadonlyArray<string>>
> = {
  'Sans Serif': {
    en: ['Interface design', 'Editorial layouts', 'Brand systems', 'Presentations'],
    'zh-CN': ['界面设计', '编辑排版', '品牌系统', '演示文稿'],
    'zh-TW': ['介面設計', '編輯排版', '品牌系統', '簡報'],
  },
  Serif: {
    en: ['Long-form reading', 'Editorial layouts', 'Books', 'Brand systems'],
    'zh-CN': ['长文阅读', '编辑排版', '书籍', '品牌系统'],
    'zh-TW': ['長文閱讀', '編輯排版', '書籍', '品牌系統'],
  },
  Display: {
    en: ['Headlines', 'Posters', 'Covers', 'Campaign graphics'],
    'zh-CN': ['标题', '海报', '封面', '活动视觉'],
    'zh-TW': ['標題', '海報', '封面', '活動視覺'],
  },
  Handwriting: {
    en: ['Invitations', 'Social graphics', 'Headlines', 'Packaging'],
    'zh-CN': ['邀请函', '社交媒体图片', '标题', '包装'],
    'zh-TW': ['邀請函', '社群圖片', '標題', '包裝'],
  },
  Monospace: {
    en: ['Code editors', 'Technical documentation', 'Data displays', 'Developer tools'],
    'zh-CN': ['代码编辑器', '技术文档', '数据展示', '开发者工具'],
    'zh-TW': ['程式碼編輯器', '技術文件', '資料顯示', '開發者工具'],
  },
}

const categoryLabels: Record<FontApprovalFacts['category'], Record<Locale, string>> = {
  'Sans Serif': { en: 'sans serif', 'zh-CN': '无衬线', 'zh-TW': '無襯線' },
  Serif: { en: 'serif', 'zh-CN': '衬线', 'zh-TW': '襯線' },
  Display: { en: 'display', 'zh-CN': '展示', 'zh-TW': '展示' },
  Handwriting: { en: 'handwriting', 'zh-CN': '手写', 'zh-TW': '手寫' },
  Monospace: { en: 'monospace', 'zh-CN': '等宽', 'zh-TW': '等寬' },
}

const coverageLabels: Record<keyof FontApprovalFacts['coverage'], Record<Locale, string>> = {
  latin: { en: 'Latin', 'zh-CN': '拉丁字符', 'zh-TW': '拉丁字元' },
  zhCN: { en: 'Simplified Chinese', 'zh-CN': '简体中文', 'zh-TW': '簡體中文' },
  zhTW: { en: 'Traditional Chinese', 'zh-CN': '繁体中文', 'zh-TW': '繁體中文' },
  japanese: { en: 'Japanese', 'zh-CN': '日文', 'zh-TW': '日文' },
  korean: { en: 'Korean', 'zh-CN': '韩文', 'zh-TW': '韓文' },
  cjkUnified: { en: 'CJK Unified', 'zh-CN': '中日韩统一表意文字', 'zh-TW': '中日韓統一表意文字' },
}

function formatCount(value: number, locale: Locale): string {
  const tag = locale === 'zh-CN' ? 'zh-CN' : locale === 'zh-TW' ? 'zh-TW' : 'en-US'
  return new Intl.NumberFormat(tag).format(value)
}

function formatPercent(value: number): string {
  const percent = Math.round(value * 1000) / 10
  return `${percent.toFixed(percent === 100 ? 0 : 1)}%`
}

function coverageSummary(font: FontApprovalFacts, locale: Locale): string {
  const entries = (
    Object.entries(font.coverage) as Array<[keyof FontApprovalFacts['coverage'], number]>
  )
    .filter(([key, value]) => key !== 'cjkUnified' && value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)

  if (entries.length === 0) {
    return locale === 'en'
      ? 'No measured language-coverage percentage is exposed for this family.'
      : locale === 'zh-CN'
        ? '当前目录没有为这个字体家族展示可用的语言覆盖率百分比。'
        : '目前目錄沒有為這個字體家族顯示可用的語言覆蓋率百分比。'
  }

  const values = entries
    .map(([key, value]) => `${coverageLabels[key][locale]} ${formatPercent(value)}`)
    .join(locale === 'en' ? ', ' : '、')

  return locale === 'en'
    ? `Measured coverage includes ${values}.`
    : locale === 'zh-CN'
      ? `实测覆盖包括：${values}。`
      : `實測覆蓋包括：${values}。`
}

function axisSummary(font: FontApprovalFacts, locale: Locale): string {
  if (font.axes.length === 0) {
    return locale === 'en'
      ? 'The analyzed release is static and does not expose a variable-font axis.'
      : locale === 'zh-CN'
        ? '当前实测版本为静态字体，没有可变字体轴。'
        : '目前實測版本為靜態字體，沒有可變字體軸。'
  }

  const axes = font.axes.join(', ')
  return locale === 'en'
    ? `Variable axes recorded in the analyzed release: ${axes}.`
    : locale === 'zh-CN'
      ? `当前实测版本记录的可变轴：${axes}。`
      : `目前實測版本記錄的可變軸：${axes}。`
}

function rfnSummary(font: FontApprovalFacts, locale: Locale): string | undefined {
  if (font.reservedFontNames.length === 0) return undefined
  const names = font.reservedFontNames.join(', ')
  return locale === 'en'
    ? `The license metadata includes Reserved Font Name restrictions (${names}); FontOdyssey does not create a derivative preview under those reserved names.`
    : locale === 'zh-CN'
      ? `许可证元数据包含保留字体名称限制（${names}）；FontOdyssey 不会使用这些保留名称生成衍生预览文件。`
      : `授權中繼資料包含保留字體名稱限制（${names}）；FontOdyssey 不會使用這些保留名稱產生衍生預覽檔。`
}

function buildEditorial(font: FontApprovalFacts, locale: Locale): FontEditorialContent {
  const styles = formatCount(font.styleCount, locale)
  const glyphs = formatCount(font.glyphCountMax, locale)
  const codepoints = formatCount(font.unicodeCodepointUnion, locale)
  const coverage = coverageSummary(font, locale)
  const axes = axisSummary(font, locale)
  const rfn = rfnSummary(font, locale)
  const category = categoryLabels[font.category][locale]

  if (locale === 'zh-CN') {
    return {
      pageId: `font:${font.slug}`,
      slug: font.slug,
      locale,
      contentStatus: 'ready',
      title: `${font.family} 字体下载与授权信息`,
      description: `下载 ${font.family}，查看 ${styles} 种样式、${font.license} 许可证、可变轴、实测字符覆盖率与可用在线预览。`,
      h1: `${font.family} 字体`,
      intro: `${font.family} 是 FontOdyssey 已验证目录中的${category}字体家族，当前版本包含 ${styles} 种样式。`,
      about: [
        `该字体以 ${font.license} 许可证进入当前发布目录。实测源文件最多包含 ${glyphs} 个 glyph，并覆盖 ${codepoints} 个 Unicode 码点。${coverage}`,
        `${axes}${rfn ? ` ${rfn}` : ''}`,
      ],
      useCases: [...categoryUseCases[font.category][locale]],
      previewText: '让每一段文字都值得被读。',
      reviewedAt,
    }
  }

  if (locale === 'zh-TW') {
    return {
      pageId: `font:${font.slug}`,
      slug: font.slug,
      locale,
      contentStatus: 'ready',
      title: `${font.family} 字體下載與授權資訊`,
      description: `下載 ${font.family}，查看 ${styles} 種樣式、${font.license} 授權、可變軸、實測字元覆蓋率與可用線上預覽。`,
      h1: `${font.family} 字體`,
      intro: `${font.family} 是 FontOdyssey 已驗證目錄中的${category}字體家族，目前版本包含 ${styles} 種樣式。`,
      about: [
        `此字體以 ${font.license} 授權進入目前發布目錄。實測來源檔最多包含 ${glyphs} 個 glyph，並覆蓋 ${codepoints} 個 Unicode 碼點。${coverage}`,
        `${axes}${rfn ? ` ${rfn}` : ''}`,
      ],
      useCases: [...categoryUseCases[font.category][locale]],
      previewText: '讓每一段文字都值得被讀。',
      reviewedAt,
    }
  }

  return {
    pageId: `font:${font.slug}`,
    slug: font.slug,
    locale,
    contentStatus: 'ready',
    title: `${font.family} Font Download & License`,
    description: `Download ${font.family} and review ${styles} styles, ${font.license} licensing, variable axes, measured character coverage, and available live preview.`,
    h1: `${font.family} Font`,
    intro: `${font.family} is a ${category} family in FontOdyssey's verified catalog. The current release contains ${styles} styles.`,
    about: [
      `This family is published under ${font.license}. The analyzed source files contain up to ${glyphs} glyphs and ${codepoints} Unicode code points. ${coverage}`,
      `${axes}${rfn ? ` ${rfn}` : ''}`,
    ],
    useCases: [...categoryUseCases[font.category][locale]],
    previewText: 'Make something worth reading.',
    reviewedAt,
  }
}

export function fontEditorialContentFor(
  font: FontApprovalFacts,
  locale: Locale,
): FontEditorialContent {
  return buildEditorial(font, locale)
}

export function buildFontEditorialSnapshot(): ReadonlyArray<FontEditorialContent> {
  return fontCatalog.flatMap((font) => locales.map((locale) => buildEditorial(font, locale)))
}

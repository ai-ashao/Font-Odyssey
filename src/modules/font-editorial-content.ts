import type { Locale } from '@/i18n/config'
import { fontCatalog } from '@/lib/font-catalog'
import type { FontApprovalFacts, FontEditorialContent } from '@/lib/font-publishing'

const reviewedAt = '2026-09-09T15:00:00Z'
const locales = ['en', 'zh-CN', 'zh-TW'] as const satisfies ReadonlyArray<Locale>

type EditorialOverride = Pick<FontEditorialContent, 'intro' | 'about' | 'useCases' | 'previewText'>

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

const curatedOverrides: Partial<Record<string, Partial<Record<Locale, EditorialOverride>>>> = {
  inter: {
    en: {
      intro: 'A variable sans serif crafted for clear reading on computer screens.',
      about: [
        'Inter is built for screen-based interfaces. Its variable axes make it useful when a design system needs flexible weight and optical-size choices without changing families.',
      ],
      useCases: ['Product interfaces', 'Dashboards', 'Documentation', 'Editorial layouts'],
      previewText: 'Sphinx of black quartz, judge my vow.',
    },
    'zh-CN': {
      intro: '一款为屏幕阅读清晰度打造的可变无衬线字体。',
      about: [
        'Inter 面向数字界面设计，可变字重和光学尺寸轴让设计系统无需更换字体家族，也能灵活调整层级与阅读体验。',
      ],
      useCases: ['产品界面', '数据看板', '技术文档', '编辑排版'],
      previewText: '让文字拥有自己的声音。',
    },
    'zh-TW': {
      intro: '一款為螢幕閱讀清晰度打造的可變無襯線字體。',
      about: [
        'Inter 以數位介面為核心，可變字重與光學尺寸軸讓設計系統不用更換字體家族，也能靈活調整層級與閱讀體驗。',
      ],
      useCases: ['產品介面', '資料儀表板', '技術文件', '編輯排版'],
      previewText: '讓文字擁有自己的聲音。',
    },
  },
  firasans: {
    en: {
      intro: 'A broad static sans-serif family designed around legibility across varied screens.',
      about: [
        'Fira Sans was designed to work across devices with different screen quality and rendering. The family includes multiple weights and italics for interface and editorial hierarchies.',
      ],
      useCases: ['Mobile interfaces', 'Editorial systems', 'Wayfinding', 'Long-form reading'],
      previewText: 'Pack my box with five dozen liquor jugs.',
    },
    'zh-CN': {
      intro: '一款注重不同屏幕环境下清晰度的完整无衬线字体家族。',
      about: [
        'Fira Sans 针对不同屏幕质量与渲染环境设计，丰富的字重和斜体能支撑界面与编辑内容的完整信息层级。',
      ],
      useCases: ['移动界面', '编辑系统', '导视设计', '长文阅读'],
      previewText: '让文字拥有自己的声音。',
    },
    'zh-TW': {
      intro: '一款重視不同螢幕環境下清晰度的完整無襯線字體家族。',
      about: [
        'Fira Sans 針對不同螢幕品質與渲染環境設計，豐富的字重和斜體能支撐介面和編輯內容的完整資訊層級。',
      ],
      useCases: ['行動介面', '編輯系統', '導視設計', '長文閱讀'],
      previewText: '讓文字擁有自己的聲音。',
    },
  },
  notoserifsc: {
    en: {
      intro: 'A modulated serif for Simplified Chinese text used in mainland China.',
      about: [
        'Noto Serif SC belongs to the Noto family and supports Simplified Chinese Han characters alongside Latin text. Its variable weight axis can cover several levels of emphasis.',
      ],
      useCases: [
        'Chinese editorial design',
        'Books',
        'Cultural publishing',
        'Multilingual layouts',
      ],
      previewText: '字体漫游，发现值得长期使用的字形。',
    },
    'zh-CN': {
      intro: '一款面向中国大陆简体中文文本的现代宋体。',
      about: [
        'Noto Serif SC 同时覆盖简体汉字与拉丁字符，可变字重轴能为正文、标题和强调内容建立完整层级。',
      ],
      useCases: ['中文编辑设计', '书籍', '文化出版', '多语言排版'],
      previewText: '字体漫游，发现值得长期使用的字形。',
    },
    'zh-TW': {
      intro: '一款面向中國大陸簡體中文文本的現代宋體。',
      about: [
        'Noto Serif SC 同時覆蓋簡體漢字與拉丁字元，可變字重軸能為正文、標題與強調內容建立完整層級。',
      ],
      useCases: ['中文編輯設計', '書籍', '文化出版', '多語言排版'],
      previewText: '字体漫游，发现值得长期使用的字形。',
    },
  },
  notoseriftc: {
    en: {
      intro: 'A modulated serif for Traditional Chinese text used in Taiwan, Hong Kong, and Macau.',
      about: [
        'Noto Serif TC belongs to the Noto family and supports Traditional Chinese Han characters alongside Latin text. Its variable weight axis supports flexible editorial hierarchy.',
      ],
      useCases: [
        'Traditional Chinese publishing',
        'Books',
        'Brand editorial',
        'Multilingual layouts',
      ],
      previewText: '字體漫遊，發現值得長期使用的字形。',
    },
    'zh-CN': {
      intro: '一款面向台湾、香港和澳门繁体中文文本的现代宋体。',
      about: [
        'Noto Serif TC 同时覆盖繁体汉字与拉丁字符，可变字重轴适合建立灵活、清晰的长文阅读层级。',
      ],
      useCases: ['繁体中文出版', '书籍', '品牌编辑', '多语言排版'],
      previewText: '字體漫遊，發現值得長期使用的字形。',
    },
    'zh-TW': {
      intro: '一款面向臺灣、香港與澳門繁體中文文本的現代宋體。',
      about: [
        'Noto Serif TC 同時覆蓋繁體漢字與拉丁字元，可變字重軸適合建立靈活、清楚的長文閱讀層級。',
      ],
      useCases: ['繁體中文出版', '書籍', '品牌編輯', '多語言排版'],
      previewText: '字體漫遊，發現值得長期使用的字形。',
    },
  },
  raleway: {
    en: {
      intro: 'An elegant sans-serif family expanded from a single thin display weight.',
      about: [
        'Raleway grew from one thin weight into a multi-weight family with italics. The verified release keeps its Reserved Font Name restrictions visible alongside the download.',
      ],
      useCases: ['Display typography', 'Headlines', 'Brand systems', 'Editorial accents'],
      previewText: 'Waltz, bad nymph, for quick jigs vex.',
    },
    'zh-CN': {
      intro: '从一款纤细展示字重扩展而来的优雅无衬线字体家族。',
      about: [
        'Raleway 后来扩展出多个字重和斜体；当前已验证版本会在下载附近明确展示保留字体名称限制。',
      ],
      useCases: ['展示排版', '标题', '品牌系统', '编辑点缀'],
      previewText: '字体漫游，发现值得长期使用的字形。',
    },
    'zh-TW': {
      intro: '從一款纖細展示字重擴展而來的優雅無襯線字體家族。',
      about: [
        'Raleway 後來擴展出多個字重與斜體；目前已驗證版本會在下載附近清楚顯示保留字體名稱限制。',
      ],
      useCases: ['展示排版', '標題', '品牌系統', '編輯點綴'],
      previewText: '字體漫遊，發現值得長期使用的字形。',
    },
  },
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

function previewMetaPhrase(
  previewStatus: FontApprovalFacts['previewStatus'],
  locale: Locale,
): string {
  if (previewStatus === 'GENERATED_SUBSET' || previewStatus === 'ORIGINAL_UNMODIFIED_WEBFONT') {
    return locale === 'en'
      ? 'a verified live preview'
      : locale === 'zh-CN'
        ? '可用在线预览'
        : '可用線上預覽'
  }

  if (previewStatus === 'UNAVAILABLE_RFN') {
    return locale === 'en'
      ? 'Reserved Font Name preview restrictions'
      : locale === 'zh-CN'
        ? '保留字体名称导致的预览限制'
        : '保留字體名稱造成的預覽限制'
  }

  return locale === 'en'
    ? 'verified release and source details'
    : locale === 'zh-CN'
      ? '已验证发布与来源信息'
      : '已驗證發布與來源資訊'
}

function buildBaselineEditorial(
  font: FontApprovalFacts,
  locale: Locale,
  effectivePreviewStatus: FontApprovalFacts['previewStatus'],
): FontEditorialContent {
  const styles = formatCount(font.styleCount, locale)
  const glyphs = formatCount(font.glyphCountMax, locale)
  const codepoints = formatCount(font.unicodeCodepointUnion, locale)
  const coverage = coverageSummary(font, locale)
  const axes = axisSummary(font, locale)
  const rfn = rfnSummary(font, locale)
  const category = categoryLabels[font.category][locale]
  const previewMeta = previewMetaPhrase(effectivePreviewStatus, locale)

  if (locale === 'zh-CN') {
    return {
      pageId: `font:${font.slug}`,
      slug: font.slug,
      locale,
      contentStatus: 'ready',
      title: `${font.family} 字体下载与授权信息`,
      description: `下载 ${font.family}，查看 ${styles} 种样式、${font.license} 许可证、实测字符覆盖率、字体格式以及${previewMeta}。`,
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
      description: `下載 ${font.family}，查看 ${styles} 種樣式、${font.license} 授權、實測字元覆蓋率、字體格式以及${previewMeta}。`,
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
    description: `Download ${font.family}; review ${styles} styles, ${font.license} licensing, measured character coverage, font format details, and ${previewMeta}.`,
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

function applyCuratedOverride(content: FontEditorialContent): FontEditorialContent {
  const override = curatedOverrides[content.slug]?.[content.locale]
  if (!override) return content

  return {
    ...content,
    intro: override.intro,
    about: [...override.about, ...content.about],
    useCases: [...override.useCases],
    previewText: override.previewText,
  }
}

export function fontEditorialContentFor(
  font: FontApprovalFacts,
  locale: Locale,
  effectivePreviewStatus: FontApprovalFacts['previewStatus'] = font.previewStatus,
): FontEditorialContent {
  return applyCuratedOverride(buildBaselineEditorial(font, locale, effectivePreviewStatus))
}

export function buildFontEditorialSnapshot(): ReadonlyArray<FontEditorialContent> {
  return fontCatalog.flatMap((font) =>
    locales.map((locale) => fontEditorialContentFor(font, locale)),
  )
}

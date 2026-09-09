import type { FontEditorialContent } from '@/lib/font-publishing'

const englishEditorial = [
  {
    pageId: 'font:inter',
    slug: 'inter',
    locale: 'en',
    contentStatus: 'draft',
    title: 'Inter font',
    description:
      'Preview Inter and review its styles, variable axes, language coverage, and license.',
    h1: 'Inter',
    intro: 'A variable sans serif crafted for clear reading on computer screens.',
    about: [
      'Inter is built for screen-based interfaces. Its variable axes make it useful when a design system needs flexible weight and optical-size choices without changing families.',
    ],
    useCases: ['Product interfaces', 'Dashboards', 'Documentation', 'Editorial layouts'],
    previewText: 'Sphinx of black quartz, judge my vow.',
  },
  {
    pageId: 'font:firasans',
    slug: 'firasans',
    locale: 'en',
    contentStatus: 'draft',
    title: 'Fira Sans font',
    description: 'Preview Fira Sans and review its styles, language coverage, and license.',
    h1: 'Fira Sans',
    intro: 'A broad static sans-serif family designed around legibility across varied screens.',
    about: [
      'Fira Sans was designed to work across devices with different screen quality and rendering. The family includes multiple weights and italics for interface and editorial hierarchies.',
    ],
    useCases: ['Mobile interfaces', 'Editorial systems', 'Wayfinding', 'Long-form reading'],
    previewText: 'Pack my box with five dozen liquor jugs.',
  },
  {
    pageId: 'font:notoserifsc',
    slug: 'notoserifsc',
    locale: 'en',
    contentStatus: 'draft',
    title: 'Noto Serif SC font',
    description: 'Preview Noto Serif SC and review its Simplified Chinese coverage and license.',
    h1: 'Noto Serif SC',
    intro: 'A modulated serif for Simplified Chinese text used in mainland China.',
    about: [
      'Noto Serif SC belongs to the Noto family and supports Simplified Chinese Han characters alongside Latin text. Its variable weight axis can cover several levels of emphasis.',
    ],
    useCases: ['Chinese editorial design', 'Books', 'Cultural publishing', 'Multilingual layouts'],
    previewText: '字体漫游，发现值得长期使用的字形。',
  },
  {
    pageId: 'font:notoseriftc',
    slug: 'notoseriftc',
    locale: 'en',
    contentStatus: 'draft',
    title: 'Noto Serif TC font',
    description: 'Preview Noto Serif TC and review its Traditional Chinese coverage and license.',
    h1: 'Noto Serif TC',
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
  {
    pageId: 'font:raleway',
    slug: 'raleway',
    locale: 'en',
    contentStatus: 'draft',
    title: 'Raleway font',
    description:
      'Review Raleway styles, language coverage, license, and Reserved Font Name limits.',
    h1: 'Raleway',
    intro: 'An elegant sans-serif family expanded from a single thin display weight.',
    about: [
      'Raleway grew from one thin weight into a multi-weight family with italics. Its Reserved Font Name means FontOdyssey will not create a derivative subset under the original family name.',
    ],
    useCases: ['Display typography', 'Headlines', 'Brand systems', 'Editorial accents'],
    previewText: 'Waltz, bad nymph, for quick jigs vex.',
  },
] as const

const chineseEditorial = [
  [
    'inter',
    'Inter',
    '一款为屏幕阅读清晰度打造的可变无衬线字体。',
    'Inter 面向数字界面设计，可变字重和光学尺寸轴让设计系统无需更换字体家族，也能灵活调整层级与阅读体验。',
    ['产品界面', '数据看板', '技术文档', '编辑排版'],
    '让文字拥有自己的声音。',
  ],
  [
    'raleway',
    'Raleway',
    '从一款纤细展示字重扩展而来的优雅无衬线字体家族。',
    'Raleway 后来扩展出多个字重和斜体。由于许可证含保留字体名称，FontOdyssey 不会以原家族名称制作衍生预览文件。',
    ['展示排版', '标题', '品牌系统', '编辑点缀'],
    '字体漫游，发现值得长期使用的字形。',
  ],
  [
    'notoseriftc',
    'Noto Serif TC',
    '一款面向台湾、香港和澳门繁体中文文本的现代宋体。',
    'Noto Serif TC 同时覆盖繁体汉字与拉丁字符，可变字重轴适合建立灵活、清晰的长文阅读层级。',
    ['繁体中文出版', '书籍', '品牌编辑', '多语言排版'],
    '字體漫遊，發現值得長期使用的字形。',
  ],
  [
    'notoserifsc',
    'Noto Serif SC',
    '一款面向中国大陆简体中文文本的现代宋体。',
    'Noto Serif SC 同时覆盖简体汉字与拉丁字符，可变字重轴能为正文、标题和强调内容建立完整层级。',
    ['中文编辑设计', '书籍', '文化出版', '多语言排版'],
    '字体漫游，发现值得长期使用的字形。',
  ],
  [
    'firasans',
    'Fira Sans',
    '一款注重不同屏幕环境下清晰度的完整无衬线字体家族。',
    'Fira Sans 针对不同屏幕质量与渲染环境设计，丰富的字重和斜体能支撑界面与编辑内容的完整信息层级。',
    ['移动界面', '编辑系统', '导视设计', '长文阅读'],
    '让文字拥有自己的声音。',
  ],
] as const

const traditionalEditorial = [
  [
    'inter',
    'Inter',
    '一款為螢幕閱讀清晰度打造的可變無襯線字體。',
    'Inter 以數位介面為核心，可變字重與光學尺寸軸讓設計系統不用更換字體家族，也能靈活調整層級與閱讀體驗。',
    ['產品介面', '資料儀表板', '技術文件', '編輯排版'],
    '讓文字擁有自己的聲音。',
  ],
  [
    'raleway',
    'Raleway',
    '從一款纖細展示字重擴展而來的優雅無襯線字體家族。',
    'Raleway 後來擴展出多個字重與斜體。由於授權含保留字體名稱，FontOdyssey 不會以原家族名稱製作衍生預覽檔。',
    ['展示排版', '標題', '品牌系統', '編輯點綴'],
    '字體漫遊，發現值得長期使用的字形。',
  ],
  [
    'notoseriftc',
    'Noto Serif TC',
    '一款面向臺灣、香港與澳門繁體中文文本的現代宋體。',
    'Noto Serif TC 同時覆蓋繁體漢字與拉丁字元，可變字重軸適合建立靈活、清楚的長文閱讀層級。',
    ['繁體中文出版', '書籍', '品牌編輯', '多語言排版'],
    '字體漫遊，發現值得長期使用的字形。',
  ],
  [
    'notoserifsc',
    'Noto Serif SC',
    '一款面向中國大陸簡體中文文本的現代宋體。',
    'Noto Serif SC 同時覆蓋簡體漢字與拉丁字元，可變字重軸能為正文、標題與強調內容建立完整層級。',
    ['中文編輯設計', '書籍', '文化出版', '多語言排版'],
    '字体漫游，发现值得长期使用的字形。',
  ],
  [
    'firasans',
    'Fira Sans',
    '一款重視不同螢幕環境下清晰度的完整無襯線字體家族。',
    'Fira Sans 針對不同螢幕品質與渲染環境設計，豐富的字重與斜體能支撐介面和編輯內容的完整資訊層級。',
    ['行動介面', '編輯系統', '導視設計', '長文閱讀'],
    '讓文字擁有自己的聲音。',
  ],
] as const

const reviewedAt = '2026-09-09T10:30:00Z'

const localizedEditorial = (
  rows: typeof chineseEditorial | typeof traditionalEditorial,
  locale: 'zh-CN' | 'zh-TW',
): FontEditorialContent[] =>
  rows.map(([slug, family, intro, about, useCases, previewText]) => ({
    pageId: `font:${slug}`,
    slug,
    locale,
    contentStatus: 'ready',
    title: `${family} ${locale === 'zh-CN' ? '字体' : '字體'}`,
    description:
      locale === 'zh-CN'
        ? `在线预览 ${family}，并查看样式、语言覆盖与许可证。`
        : `線上預覽 ${family}，並查看樣式、語言覆蓋與授權。`,
    h1: family,
    intro,
    about: [about],
    useCases: [...useCases],
    previewText,
    reviewedAt,
  }))

export const fontEditorialContent: ReadonlyArray<FontEditorialContent> = [
  ...englishEditorial.map((content) => ({
    ...content,
    contentStatus: 'ready' as const,
    reviewedAt,
    about: [...content.about],
    useCases: [...content.useCases],
  })),
  ...localizedEditorial(chineseEditorial, 'zh-CN'),
  ...localizedEditorial(traditionalEditorial, 'zh-TW'),
]

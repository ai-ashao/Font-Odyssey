import type { FontEditorialContent } from '@/lib/font-publishing'

export const fontEditorialContent = [
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
] as const satisfies ReadonlyArray<FontEditorialContent>

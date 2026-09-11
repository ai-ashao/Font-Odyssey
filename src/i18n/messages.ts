import type { Locale } from './config'

type ShellMessages = {
  primaryNavigation: string
  mobileNavigation: string
  nav: {
    home: string
    tools: string
  }
  languageSwitcher: string
  footer: {
    about: string
    contact: string
    privacy: string
    terms: string
  }
  notFound: {
    kicker: string
    title: string
    returnHome: string
  }
}

export const shellMessages = {
  en: {
    primaryNavigation: 'Primary navigation',
    mobileNavigation: 'Menu',
    nav: {
      home: 'Home',
      tools: 'Fonts',
    },
    languageSwitcher: 'Language switcher',
    footer: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    notFound: {
      kicker: '404 / Not found',
      title: 'This page could not be found.',
      returnHome: 'Return home',
    },
  },
  'zh-CN': {
    primaryNavigation: '主导航',
    mobileNavigation: '菜单',
    nav: {
      home: '首页',
      tools: '字体',
    },
    languageSwitcher: '语言切换',
    footer: {
      about: '关于我们',
      contact: '联系',
      privacy: '隐私政策',
      terms: '服务条款',
    },
    notFound: {
      kicker: '404 / 页面不存在',
      title: '没有找到这个页面。',
      returnHome: '返回首页',
    },
  },
  'zh-TW': {
    primaryNavigation: '主導覽',
    mobileNavigation: '選單',
    nav: {
      home: '首頁',
      tools: '字體',
    },
    languageSwitcher: '語言切換',
    footer: {
      about: '關於我們',
      contact: '聯絡',
      privacy: '隱私政策',
      terms: '服務條款',
    },
    notFound: {
      kicker: '404 / 頁面不存在',
      title: '找不到這個頁面。',
      returnHome: '返回首頁',
    },
  },
} satisfies Record<Locale, ShellMessages>

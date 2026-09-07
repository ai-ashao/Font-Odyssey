import type { Locale } from './config'

type ShellMessages = {
  primaryNavigation: string
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
} satisfies Record<Locale, ShellMessages>

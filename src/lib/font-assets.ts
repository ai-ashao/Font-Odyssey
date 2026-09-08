import { fontDownloadOverrides } from '@/data/font-downloads'
import type { Locale } from '@/i18n/config'
import type { FontCatalogItem } from './font-catalog'
import { verifiedAssetReleaseForSlug } from './font-publication'

export type FontDownloadSource = {
  id: 'quark' | 'baidu' | 'r2' | 'official'
  label: string
  url: string
  primary: boolean
  sponsored: boolean
}

export function fontPreviewUrl(font: FontCatalogItem): string | undefined {
  return verifiedAssetReleaseForSlug(font.slug)?.preview?.url
}

export function fontR2DownloadUrl(font: FontCatalogItem): string | undefined {
  return verifiedAssetReleaseForSlug(font.slug)?.package.url
}

export function fontOfficialSourceUrl(font: FontCatalogItem): string {
  return `https://github.com/google/fonts/tree/${font.sourceCommit}/${font.sourcePath}`
}

export function fontDownloadSources(font: FontCatalogItem, locale: Locale): FontDownloadSource[] {
  const overrides = fontDownloadOverrides[font.slug] || {}
  const r2 = fontR2DownloadUrl(font)

  if (locale === 'zh-CN') {
    const sources: FontDownloadSource[] = []
    if (overrides.quark) {
      sources.push({
        id: 'quark',
        label: overrides.quark.ctaMode === 'fast' ? '高速网盘下载' : '夸克网盘下载',
        url: overrides.quark.url,
        primary: true,
        sponsored: true,
      })
    }
    if (overrides.baidu) {
      sources.push({
        id: 'baidu',
        label: '百度网盘',
        url: overrides.baidu.url,
        primary: !overrides.quark,
        sponsored: true,
      })
    }
    if (r2) {
      sources.push({
        id: 'r2',
        label: '普通下载',
        url: r2,
        primary: sources.length === 0,
        sponsored: false,
      })
    }
    if (sources.length > 0) return sources
  } else if (r2) {
    return [
      {
        id: 'r2',
        label: locale === 'zh-TW' ? '免費下載' : 'Download font',
        url: r2,
        primary: true,
        sponsored: false,
      },
    ]
  }

  return [
    {
      id: 'official',
      label:
        locale === 'zh-CN'
          ? '查看官方来源'
          : locale === 'zh-TW'
            ? '查看官方來源'
            : 'View official source',
      url: fontOfficialSourceUrl(font),
      primary: true,
      sponsored: false,
    },
  ]
}

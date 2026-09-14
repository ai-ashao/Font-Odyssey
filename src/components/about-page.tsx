import type { Locale } from '@/i18n/config'
import { InformationPage } from './information-page'

const copy = {
  en: {
    eyebrow: 'About',
    title: 'A smaller font library with a stronger point of view.',
    description:
      'FontOdyssey curates a focused collection of popular, multilingual fonts instead of building another endless directory.',
    sections: [
      {
        title: 'How fonts enter the catalog',
        body: 'Every published family must pass the same source, metadata, license, editorial, and release gates. Curation rank records the public editorial order; it is not generated from an alphabetical import.',
      },
      {
        title: 'Source and license review',
        body: 'We tie each release to a traceable upstream source commit and review the license facts before publication. Reserved Font Names are handled conservatively, so some families remain download-only instead of receiving a derivative web preview.',
      },
      {
        title: 'Download integrity',
        body: 'Published archives, license files, and eligible preview fonts are stored as versioned objects. Before a release is marked verified, the public object is read back over HTTPS and checked against its recorded byte size, content type, and SHA-256 digest.',
      },
      {
        title: 'Measured character coverage',
        body: 'Language and character coverage comes from analyzed font metadata rather than a marketing label. A web specimen may be a small subset; the downloadable archive contains the original approved font files for that release.',
      },
      {
        title: 'Corrections and takedowns',
        body: 'Font authors, rights holders, and users can contact us about source attribution, licensing, metadata, or file integrity. We investigate credible reports and can remove a release from publication while it is reviewed.',
      },
    ],
  },
  'zh-CN': {
    eyebrow: '关于我们',
    title: '规模更小，但策展标准更明确的字体目录。',
    description:
      'FontOdyssey 精选常用的多语言字体，不追求无边界镜像，而是让来源、授权和下载依据更容易核对。',
    sections: [
      {
        title: '字体如何进入目录',
        body: '每个公开字体家族都必须通过来源、元数据、许可证、编辑内容和发布资源门禁。策展编号记录公开的编辑顺序，不是按字母批量导入产生的排名。',
      },
      {
        title: '来源与许可证审核',
        body: '每个发布版本都关联到可追溯的上游源码提交，并在上线前核对许可证事实。我们保守处理 Reserved Font Names，因此部分字体只提供下载，不生成衍生网页预览。',
      },
      {
        title: '下载完整性',
        body: '字体压缩包、许可证文件和合规预览字体均使用带版本的对象地址。标记为已验证之前，我们会通过 HTTPS 回读公开资源，并核对字节数、内容类型和 SHA-256 摘要。',
      },
      {
        title: '字符覆盖如何测量',
        body: '语言与字符覆盖来自字体文件的实际元数据分析，而不是营销标签。网页预览可能只是小型子集；下载包包含该发布版本中通过审核的原始字体文件。',
      },
      {
        title: '纠错与下架',
        body: '字体作者、权利人和用户都可以就来源署名、许可证、元数据或文件完整性联系我们。对于可信报告，我们会调查，并可在复核期间暂停对应发布版本。',
      },
    ],
  },
  'zh-TW': {
    eyebrow: '關於我們',
    title: '規模更小，但策展標準更明確的字體目錄。',
    description:
      'FontOdyssey 精選常用的多語言字體，不追求無邊界鏡像，而是讓來源、授權與下載依據更容易核對。',
    sections: [
      {
        title: '字體如何進入目錄',
        body: '每個公開字體家族都必須通過來源、中繼資料、授權、編輯內容與發布資源門檻。策展編號記錄公開的編輯順序，不是依字母批次匯入產生的排名。',
      },
      {
        title: '來源與授權審核',
        body: '每個發布版本都連結到可追溯的上游原始碼提交，並在上線前核對授權事實。我們保守處理 Reserved Font Names，因此部分字體只提供下載，不產生衍生網頁預覽。',
      },
      {
        title: '下載完整性',
        body: '字體壓縮檔、授權文件與合規預覽字體均使用帶版本的物件網址。標記為已驗證之前，我們會透過 HTTPS 回讀公開資源，並核對位元組數、內容類型與 SHA-256 摘要。',
      },
      {
        title: '字元涵蓋如何測量',
        body: '語言與字元涵蓋來自字體檔案的實際中繼資料分析，而不是行銷標籤。網頁預覽可能只是小型子集；下載包包含該發布版本中通過審核的原始字體檔案。',
      },
      {
        title: '更正與下架',
        body: '字體作者、權利人與使用者都可以就來源署名、授權、中繼資料或檔案完整性聯絡我們。對於可信報告，我們會調查，並可在複核期間暫停對應發布版本。',
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    eyebrow: string
    title: string
    description: string
    sections: Array<{ title: string; body: string }>
  }
>

export function AboutPage({ locale }: Readonly<{ locale: Locale }>) {
  const content = copy[locale]
  return (
    <InformationPage {...content} locale={locale}>
      {content.sections.map((section) => (
        <section className="mt-8 first:mt-0" key={section.title}>
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </InformationPage>
  )
}

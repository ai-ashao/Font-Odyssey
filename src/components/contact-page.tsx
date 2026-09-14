import type { Locale } from '@/i18n/config'
import { legalProfile } from '@/modules/legal-profile'
import { InformationPage } from './information-page'

const copy = {
  en: {
    eyebrow: 'Contact',
    title: 'Questions about a font or its license?',
    description:
      'Contact FontOdyssey about catalog corrections, source attribution, licensing, or download integrity.',
    lead: 'Email',
    response:
      'Include the font family, affected page, and the source or license evidence you want us to review. Please do not send font files unless we request them.',
  },
  'zh-CN': {
    eyebrow: '联系我们',
    title: '对字体、来源或许可证有疑问？',
    description: '如需报告目录错误、来源署名、许可证或下载完整性问题，请联系 FontOdyssey。',
    lead: '请发送邮件至',
    response:
      '请写明字体家族、相关页面，以及希望我们复核的来源或许可证依据。除非我们提出请求，请不要直接发送字体文件。',
  },
  'zh-TW': {
    eyebrow: '聯絡我們',
    title: '對字體、來源或授權有疑問？',
    description: '如需回報目錄錯誤、來源署名、授權或下載完整性問題，請聯絡 FontOdyssey。',
    lead: '請寄信至',
    response:
      '請寫明字體家族、相關頁面，以及希望我們複核的來源或授權依據。除非我們提出要求，請不要直接傳送字體檔案。',
  },
} satisfies Record<
  Locale,
  { eyebrow: string; title: string; description: string; lead: string; response: string }
>

export function ContactPage({ locale }: Readonly<{ locale: Locale }>) {
  const content = copy[locale]
  return (
    <InformationPage {...content} locale={locale}>
      <p>
        {content.lead}{' '}
        <a href={`mailto:${legalProfile.contactEmail}`}>{legalProfile.contactEmail}</a>.
      </p>
      <p>{content.response}</p>
    </InformationPage>
  )
}

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Locale } from '@/i18n/config'
import { localizedPathOrDefault } from '@/i18n/routes'

export function InformationPage({
  eyebrow,
  title,
  description,
  children,
  locale = 'en',
}: Readonly<{
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  locale?: Locale
}>) {
  return (
    <section className="mx-auto max-w-[860px] px-4 py-10 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <Badge
          variant="outline"
          className="border-[#dce8d4] bg-[#f4f8f1] font-mono text-[10px] uppercase tracking-widest text-[#5d9229]"
        >
          {eyebrow}
        </Badge>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </header>
      <div className="prose mt-10 max-w-none text-sm leading-7 text-muted-foreground">
        {children}
      </div>
      <p className="mt-10 text-sm">
        <a
          className="font-medium text-[#4f8521] underline-offset-4 hover:underline"
          href={localizedPathOrDefault('home', locale)}
        >
          {locale === 'en'
            ? 'Return to FontOdyssey'
            : locale === 'zh-CN'
              ? '返回 FontOdyssey'
              : '返回 FontOdyssey'}
        </a>
      </p>
    </section>
  )
}

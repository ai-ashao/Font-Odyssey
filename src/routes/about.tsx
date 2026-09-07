import { createFileRoute } from '@tanstack/react-router'
import { InformationPage } from '@/components/information-page'
import { localizedPageHead } from '@/lib/seo'
import { site } from '@/lib/site'

export const Route = createFileRoute('/about')({
  head: () =>
    localizedPageHead({
      pageId: 'about',
      locale: 'en',
      title: 'About Us',
      description: `Learn what ${site.name} is built to help its users accomplish.`,
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <InformationPage
      eyebrow="About"
      title="A smaller font library with a stronger point of view."
      description="FontOdyssey curates a focused collection of popular, multilingual fonts instead of building another endless directory."
    >
      <p>
        Every launch font passes a source, metadata, and license gate before it can enter the
        catalog. Featured order reflects editorial value rather than alphabetical ingestion order.
      </p>
      <p>
        The first collection emphasizes widely useful Latin, Chinese, Japanese, and Korean families,
        with clear category and language filters.
      </p>
    </InformationPage>
  )
}

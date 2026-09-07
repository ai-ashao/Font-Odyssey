import { createFileRoute } from '@tanstack/react-router'
import { InformationPage } from '@/components/information-page'
import { localizedPageHead } from '@/lib/seo'
import { site } from '@/lib/site'
import { legalProfile } from '@/modules/legal-profile'

export const Route = createFileRoute('/contact')({
  head: () =>
    localizedPageHead({
      pageId: 'contact',
      locale: 'en',
      title: 'Contact',
      description: `Find the support details for ${site.name}.`,
    }),
  component: ContactPage,
})

function ContactPage() {
  return (
    <InformationPage
      eyebrow="Contact"
      title="Questions about a font or its license?"
      description="Contact FontOdyssey about catalog corrections, source attribution, or download issues."
    >
      <p>
        Email <a href={`mailto:${legalProfile.contactEmail}`}>{legalProfile.contactEmail}</a>. The
        address follows the configured public domain; email delivery and DNS remain a production
        launch gate.
      </p>
    </InformationPage>
  )
}

import { FAQ_ITEMS } from '@/screens/marketing/constants/FAQ_ITEMS'
import { PAGE_META } from '@/screens/marketing/constants/PAGE_META'
import { PUBLISHER } from '@/screens/marketing/constants/PUBLISHER'
import { SITE_NAME } from '@/screens/marketing/constants/SITE_NAME'
import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'
import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'
import { videoUrl } from '@/screens/marketing/utils/videoUrl'

// 'mm:ss' -> 'PT1M44S' (ISO 8601 duration, what VideoObject wants)
const isoDuration = (length: string) => {
  const [m, s] = length.split(':').map(Number)
  return `PT${m}M${s}S`
}

// The JSON-LD objects for a page: the organization and site on every page, the app and its FAQ on the landing
// page, and one VideoObject per chapter on the tutorial. Everything here is also visible on the page itself.
export function structuredData(route: MarketingRoute): object[] {
  const organization = {
    '@type': 'Organization',
    name: PUBLISHER.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/logo-mark.png'),
    email: PUBLISHER.email,
    sameAs: [PUBLISHER.github],
  }
  const site = { '@type': 'WebSite', name: SITE_NAME, url: absoluteUrl('/') }
  const graph: object[] = [organization, site]
  if (route === 'home') {
    graph.push({
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: PAGE_META.home.description,
      url: absoluteUrl('/'),
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, macOS, Windows, Linux',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://opensource.org/licenses/MIT',
      codeRepository: PUBLISHER.github,
      publisher: { '@type': 'Organization', name: PUBLISHER.name },
    })
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }
  if (route === 'tutorial') {
    for (const c of TUTORIAL_CHAPTERS) {
      graph.push({
        '@type': 'VideoObject',
        name: `Ledger tutorial: ${c.title}`,
        description: c.summary,
        duration: isoDuration(c.length),
        thumbnailUrl: videoUrl(`${c.file}.jpg`),
        contentUrl: videoUrl(`${c.file}.mp4`),
        uploadDate: '2026-11-08T12:00:00+00:00',
      })
    }
  }
  return [{ '@context': 'https://schema.org', '@graph': graph }]
}

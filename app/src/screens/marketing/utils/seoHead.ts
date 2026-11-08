import { PAGE_META } from '@/screens/marketing/constants/PAGE_META'
import { PAGE_PATHS } from '@/screens/marketing/constants/PAGE_PATHS'
import { SITE_NAME } from '@/screens/marketing/constants/SITE_NAME'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'
import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'
import { escapeHtml } from '@/screens/marketing/utils/escapeHtml'
import { structuredData } from '@/screens/marketing/utils/structuredData'

// Every <head> tag a prerendered page needs: title, description, canonical link, Open Graph and Twitter cards,
// JSON-LD and the page's own extra tags (fonts). Returned as HTML, one tag per line.
export function seoHead(route: MarketingRoute): string {
  const meta = PAGE_META[route]
  const url = absoluteUrl(PAGE_PATHS[route])
  const image = absoluteUrl('/og.png')
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="theme-color" content="#0b0f1d" />`,
    `<script type="application/ld+json">${JSON.stringify(structuredData(route)).replace(/</g, '\\u003c')}</script>`,
  ]
  if (meta.head) tags.push(meta.head)
  return tags.join('\n    ')
}

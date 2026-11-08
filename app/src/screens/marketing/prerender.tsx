import { renderToString } from 'react-dom/server'
import { MarketingPage } from '@/screens/marketing/ui/MarketingPage'
import { PAGE_META } from '@/screens/marketing/constants/PAGE_META'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'

// Used by scripts/prerender.mjs at build time: the HTML for a marketing page plus its head tags.
export function renderMarketing(route: MarketingRoute) {
  return { html: renderToString(<MarketingPage route={route} />), meta: PAGE_META[route] }
}

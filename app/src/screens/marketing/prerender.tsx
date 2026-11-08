import { renderToString } from 'react-dom/server'
import { MarketingPage } from '@/screens/marketing/ui/MarketingPage'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'
import { seoHead } from '@/screens/marketing/utils/seoHead'
import { sitemapXml } from '@/screens/marketing/utils/sitemapXml'
import { robotsTxt } from '@/screens/marketing/utils/robotsTxt'
import { llmsTxt } from '@/screens/marketing/utils/llmsTxt'

// Used by scripts/prerender.mjs at build time: the HTML for a marketing page plus its head tags.
export function renderMarketing(route: MarketingRoute) {
  return { html: renderToString(<MarketingPage route={route} />), head: seoHead(route) }
}

// The crawler files written next to the pages.
export function renderSiteFiles(lastModified: string) {
  return { 'sitemap.xml': sitemapXml(lastModified), 'robots.txt': robotsTxt(), 'llms.txt': llmsTxt() }
}

import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'

// Everyone may crawl the public pages, including AI search and training crawlers: the point of the site is to be
// known. The app itself holds nothing for a crawler (it shows an empty state until you upload your own file).
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\nDisallow: /app\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
}

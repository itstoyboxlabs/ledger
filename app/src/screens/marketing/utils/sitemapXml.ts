import { PAGE_PATHS } from '@/screens/marketing/constants/PAGE_PATHS'
import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'

// The sitemap for the public pages. `lastModified` is an ISO date, the day the pages last changed.
export function sitemapXml(lastModified: string): string {
  const urls = Object.values(PAGE_PATHS)
    .map((p) => `  <url>\n    <loc>${absoluteUrl(p)}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

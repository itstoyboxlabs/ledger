import { SITE_URL } from '@/screens/marketing/constants/SITE_URL'
import { sitemapXml } from '@/screens/marketing/utils/sitemapXml'

describe('sitemapXml', () => {
  it('lists the landing page and the tutorial with the given date', () => {
    const xml = sitemapXml('2026-11-08')
    expect(xml).toContain(`<loc>${SITE_URL}/</loc>`)
    expect(xml).toContain(`<loc>${SITE_URL}/tutorial</loc>`)
    expect(xml.match(/<lastmod>2026-11-08<\/lastmod>/g)).toHaveLength(2)
    expect(xml).not.toContain('/app')
  })
})

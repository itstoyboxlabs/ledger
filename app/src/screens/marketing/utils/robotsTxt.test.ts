import { SITE_URL } from '@/screens/marketing/constants/SITE_URL'
import { robotsTxt } from '@/screens/marketing/utils/robotsTxt'

describe('robotsTxt', () => {
  it('allows crawling, hides the app and names the sitemap', () => {
    const t = robotsTxt()
    expect(t).toContain('User-agent: *\nAllow: /')
    expect(t).toContain('Disallow: /app')
    expect(t).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
    expect(t).not.toMatch(/GPTBot|ClaudeBot/)
  })
})

import { SITE_URL } from '@/screens/marketing/constants/SITE_URL'
import { seoHead } from '@/screens/marketing/utils/seoHead'

describe('seoHead', () => {
  it('has a title, description, canonical and social cards for the landing page', () => {
    const h = seoHead('home')
    expect(h).toContain("<title>Ledger · Financial planning that doesn't oversimplify you</title>")
    expect(h).toContain(`<link rel="canonical" href="${SITE_URL}/" />`)
    expect(h).toContain(`<meta property="og:url" content="${SITE_URL}/" />`)
    expect(h).toContain(`<meta property="og:image" content="${SITE_URL}/og.png" />`)
    expect(h).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(h).toContain('application/ld+json')
  })

  it('the tutorial points its canonical at /tutorial', () => {
    expect(seoHead('tutorial')).toContain(`<link rel="canonical" href="${SITE_URL}/tutorial" />`)
  })

  it('escapes the description and keeps the fonts', () => {
    const h = seoHead('home')
    expect(h).not.toMatch(/content="[^"]*"[^"]*"[^"]*" \/>/)
    expect(h).toContain('fonts.googleapis.com')
  })
})

import { SITE_URL } from '@/screens/marketing/constants/SITE_URL'
import { absoluteUrl } from '@/screens/marketing/utils/absoluteUrl'

describe('absoluteUrl', () => {
  it('joins a path onto the site address', () => {
    expect(absoluteUrl('/tutorial')).toBe(`${SITE_URL}/tutorial`)
    expect(absoluteUrl('tutorial')).toBe(`${SITE_URL}/tutorial`)
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
  })

  it('the site address has no trailing slash', () => {
    expect(SITE_URL.endsWith('/')).toBe(false)
    expect(SITE_URL.startsWith('https://')).toBe(true)
  })
})

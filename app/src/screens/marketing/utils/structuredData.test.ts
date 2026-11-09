import { TUTORIAL_CHAPTERS } from '@/screens/marketing/constants/TUTORIAL_CHAPTERS'
import { structuredData } from '@/screens/marketing/utils/structuredData'

type Node = { '@type': string; [k: string]: unknown }
const graph = (route: 'home' | 'tutorial') => (structuredData(route)[0] as { '@graph': Node[] })['@graph']

describe('structuredData', () => {
  it('describes the organization and the site on every page', () => {
    for (const route of ['home', 'tutorial'] as const) {
      const types = graph(route).map((n) => n['@type'])
      expect(types).toContain('Organization')
      expect(types).toContain('WebSite')
    }
  })

  it('the landing page lists the app as free software with an FAQ', () => {
    const app = graph('home').find((n) => n['@type'] === 'SoftwareApplication') as Node & { offers: { price: string } }
    expect(app.offers.price).toBe('0')
    expect(app.applicationCategory).toBe('FinanceApplication')
    const faq = graph('home').find((n) => n['@type'] === 'FAQPage') as Node & { mainEntity: unknown[] }
    expect(faq.mainEntity.length).toBeGreaterThan(2)
  })

  it('the tutorial lists one video per chapter with an ISO duration', () => {
    const videos = graph('tutorial').filter((n) => n['@type'] === 'VideoObject')
    expect(videos).toHaveLength(TUTORIAL_CHAPTERS.length)
    expect(videos[0].duration).toMatch(/^PT\d+M\d+S$/)
    expect(String(videos[0].contentUrl)).toMatch(/\/videos\/chapter-1-intro\.mp4(\?v=\d+)?$/)
  })

  it('is valid JSON with a schema.org context', () => {
    const json = JSON.parse(JSON.stringify(structuredData('home')))
    expect(json[0]['@context']).toBe('https://schema.org')
  })
})

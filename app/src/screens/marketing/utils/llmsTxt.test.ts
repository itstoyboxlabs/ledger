import { FAQ_ITEMS } from '@/screens/marketing/constants/FAQ_ITEMS'
import { llmsTxt } from '@/screens/marketing/utils/llmsTxt'

describe('llmsTxt', () => {
  it('starts with the product name and a one-line summary', () => {
    const t = llmsTxt()
    expect(t.startsWith('# Ledger\n\n> ')).toBe(true)
  })
  it('states the price, where data lives and links the pages', () => {
    const t = llmsTxt()
    expect(t).toContain('Price: free')
    expect(t).toContain('no analytics on your data')
    expect(t).toContain('/tutorial')
    expect(t).toContain('github.com/itstoyboxlabs/ledger')
  })
  it('repeats every FAQ answer', () => {
    const t = llmsTxt()
    for (const f of FAQ_ITEMS) expect(t).toContain(f.question)
  })
  it('stays under about 2,000 words', () => {
    expect(llmsTxt().split(/\s+/).length).toBeLessThan(2000)
  })
})

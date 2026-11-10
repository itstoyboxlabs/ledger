import { usageEnabled } from '@/shared/utils/usageEnabled'

describe('usageEnabled', () => {
  afterEach(() => vi.unstubAllEnvs())
  it('is off on the dev server', () => {
    expect(usageEnabled('example.com')).toBe(false)
  })
  it('is off on localhost addresses', () => {
    vi.stubEnv('DEV', false)
    for (const h of ['localhost', '127.0.0.1', '[::1]', 'x.localhost']) expect(usageEnabled(h)).toBe(false)
  })
  it('is on for a real host in a build', () => {
    vi.stubEnv('DEV', false)
    expect(usageEnabled('ledgerfinancialplanning.com')).toBe(true)
  })
})

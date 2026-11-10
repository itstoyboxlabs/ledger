import { viewForPath } from '@/shared/utils/viewForPath'

describe('viewForPath', () => {
  it('finds the screen for an address', () => {
    expect(viewForPath('/app/spending')).toBe('actuals')
    expect(viewForPath('/app/getting-started/')).toBe('guide')
  })
  it('returns null for /app and unknown addresses', () => {
    expect(viewForPath('/app')).toBeNull()
    expect(viewForPath('/app/nope')).toBeNull()
  })
})

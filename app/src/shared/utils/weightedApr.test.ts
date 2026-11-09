import { weightedApr } from './weightedApr'

describe('weightedApr', () => {
  it('is 0 with nothing owed', () => {
    expect(weightedApr([])).toBe(0)
    expect(weightedApr([{ apr: 20, balance: 0 }])).toBe(0)
  })
  it('is the one rate for one debt', () => {
    expect(weightedApr([{ apr: 18, balance: 5000 }])).toBe(18)
  })
  it('weights each rate by its balance', () => {
    // 12,000 at 0% and 3,000 at 20% is 4%
    expect(weightedApr([{ apr: 0, balance: 12000 }, { apr: 20, balance: 3000 }])).toBe(4)
  })
})

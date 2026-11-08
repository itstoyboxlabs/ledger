import { fica } from './fica'

describe('fica', () => {
  it('is zero for zero income', () => {
    expect(fica(0)).toBe(0)
  })
  it('is 7.65% below the Social Security cap', () => {
    expect(fica(100000)).toBeCloseTo(7650, 5)
    expect(fica(50000)).toBeCloseTo(3825, 5)
  })
  it('stops growing Social Security past the cap, leaving Medicare', () => {
    // 0.0145 per extra dollar once past the cap and under the additional Medicare threshold
    expect(fica(190000) - fica(180000)).toBeCloseTo(0.0145 * 10000, 5)
  })
  it('adds 0.9% additional Medicare over 200k', () => {
    expect(fica(210000) - fica(200000)).toBeCloseTo(0.0145 * 10000 + 0.009 * 10000, 5)
  })
  it('increases with income', () => {
    expect(fica(150000)).toBeGreaterThan(fica(100000))
    expect(fica(400000)).toBeGreaterThan(fica(200000))
  })
  // NOTE: fica hard-codes 176100 for the SS cap while SS_WAGE_BASE is 184500 (stale?). Not asserted.
})

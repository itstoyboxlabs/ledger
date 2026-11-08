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
    expect(fica(195000) - fica(185000)).toBeCloseTo(0.0145 * 10000, 5)
  })
  it('adds 0.9% additional Medicare over 200k', () => {
    expect(fica(210000) - fica(200000)).toBeCloseTo(0.0145 * 10000 + 0.009 * 10000, 5)
  })
  it('increases with income', () => {
    expect(fica(150000)).toBeGreaterThan(fica(100000))
    expect(fica(400000)).toBeGreaterThan(fica(200000))
  })
  it('caps Social Security at the wage base', () => {
    const atCap = fica(184500)
    expect(fica(190000) - atCap).toBeCloseTo(0.0145 * 5500, 2)
    expect(atCap).toBeCloseTo(0.062 * 184500 + 0.0145 * 184500, 2)
  })
})

describe('fica by filing status', () => {
  it('is unchanged for single filers', () => {
    for (const g of [0, 50000, 200000, 210000, 300000]) expect(fica(g, 'single')).toBe(fica(g))
  })
  it('starts Additional Medicare at 250k for joint filers', () => {
    expect(fica(250000, 'mfj')).toBeCloseTo(0.062 * 184500 + 0.0145 * 250000, 5)
    expect(fica(300000, 'mfj')).toBeCloseTo(16239, 5)
    expect(fica(220000, 'mfj')).toBeLessThan(fica(220000))
  })
})

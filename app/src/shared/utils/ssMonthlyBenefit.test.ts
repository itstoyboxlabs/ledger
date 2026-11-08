import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'
import { ssMonthlyBenefit } from './ssMonthlyBenefit'

describe('ssMonthlyBenefit', () => {
  it('is zero for no, negative or junk salary', () => {
    expect(ssMonthlyBenefit(0, 67)).toBe(0)
    expect(ssMonthlyBenefit(-5000, 67)).toBe(0)
    expect(ssMonthlyBenefit('abc', 67)).toBe(0)
  })
  it('pays 90% of earnings under the first bend point', () => {
    // aime = 1286 when salary = 1286 * 12
    expect(ssMonthlyBenefit(1286 * 12, 67)).toBeCloseTo(0.9 * 1286, 5)
  })
  it('matches the three-tier formula at the wage base', () => {
    const aime = SS_WAGE_BASE / 12
    const pia = 0.9 * 1286 + 0.32 * (7749 - 1286) + 0.15 * (aime - 7749)
    expect(ssMonthlyBenefit(SS_WAGE_BASE, 67)).toBeCloseTo(pia, 5)
  })
  it('ignores salary above the wage base', () => {
    expect(ssMonthlyBenefit(SS_WAGE_BASE * 3, 67)).toBe(ssMonthlyBenefit(SS_WAGE_BASE, 67))
  })
  it('scales with the claim age factor', () => {
    const at67 = ssMonthlyBenefit(100000, 67)
    expect(ssMonthlyBenefit(100000, 62)).toBeCloseTo(at67 * 0.7, 5)
    expect(ssMonthlyBenefit(100000, 70)).toBeCloseTo(at67 * 1.24, 5)
  })
  it('grows with salary', () => {
    expect(ssMonthlyBenefit(120000, 67)).toBeGreaterThan(ssMonthlyBenefit(60000, 67))
  })
})

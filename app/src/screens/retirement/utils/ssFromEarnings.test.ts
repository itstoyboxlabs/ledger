import { ssFromEarnings } from './ssFromEarnings'
import { ssMonthlyBenefit } from '@/shared/utils/ssMonthlyBenefit'
import { SS_WAGE_BASE } from '@/shared/constants/SS_WAGE_BASE'

describe('ssFromEarnings', () => {
  it('matches the steady salary estimate for 35 equal years', () => {
    expect(ssFromEarnings(Array(35).fill(90000), 67)).toBeCloseTo(ssMonthlyBenefit(90000, 67), 6)
  })
  it('uses only the best 35 years', () => {
    expect(ssFromEarnings([...Array(35).fill(90000), ...Array(10).fill(10000)], 67)).toBeCloseTo(ssMonthlyBenefit(90000, 67), 6)
  })
  it('counts missing years as zero', () => {
    expect(ssFromEarnings(Array(10).fill(90000), 67)).toBeLessThan(ssMonthlyBenefit(90000, 67))
  })
  it('caps each year at the wage base', () => {
    expect(ssFromEarnings(Array(35).fill(SS_WAGE_BASE * 3), 67)).toBeCloseTo(ssMonthlyBenefit(SS_WAGE_BASE, 67), 6)
  })
})

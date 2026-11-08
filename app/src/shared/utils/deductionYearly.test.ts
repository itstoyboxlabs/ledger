import { deductionYearly } from './deductionYearly'
import type { Deduction } from '@/shared/types/Deduction'

describe('deductionYearly', () => {
  it('takes a percent of salary', () => expect(deductionYearly({ unit: 'pct', amount: 10 }, 120000)).toBe(12000))
  it('multiplies monthly amounts by 12', () => expect(deductionYearly({ unit: 'mo', amount: 150 }, 100000)).toBe(1800))
  it('uses yearly amounts as is', () => expect(deductionYearly({ unit: 'yr', amount: 500 }, 100000)).toBe(500))
  it('treats bad or empty amounts as zero', () => {
    expect(deductionYearly({ unit: 'mo', amount: 'abc' as unknown as number }, 1)).toBe(0)
    expect(deductionYearly({ unit: 'pct' } as Deduction, 50000)).toBe(0)
    expect(deductionYearly({ unit: 'pct', amount: 5 }, 0)).toBe(0)
  })
})

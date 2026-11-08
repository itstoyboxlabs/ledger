import { takeHome401kYearly } from './takeHome401kYearly'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

describe('takeHome401kYearly', () => {
  it('sums 401k and roth 401k deductions only', () => {
    const th = {
      salary: 100000,
      deductions: [
        { id: 'a', kind: '401k', unit: 'pct', amount: 5 },
        { id: 'b', kind: 'roth401k', unit: 'mo', amount: 100 },
        { id: 'c', kind: 'insurance', unit: 'mo', amount: 200 },
      ],
    } as RawTakeHome
    expect(takeHome401kYearly(th)).toBe(5000 + 1200)
  })
  it('is zero without any 401k line', () => {
    expect(takeHome401kYearly({ salary: 50000, deductions: [{ id: 'c', kind: 'insurance', unit: 'yr', amount: 900 }] })).toBe(0)
  })
  it('is zero for an empty deduction list', () => {
    expect(takeHome401kYearly({ salary: 50000, deductions: [] })).toBe(0)
  })
})

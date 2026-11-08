import { takeHomeBreakdown } from './takeHomeBreakdown'
import { takeHomeMonthly } from './takeHomeMonthly'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

describe('takeHomeMonthly', () => {
  const th: RawTakeHome = { salary: 120000, deductions: [{ id: 'a', kind: '401k', unit: 'pct', amount: 5 }] }
  it('is the yearly net divided by 12', () => expect(takeHomeMonthly(th, 'wy')).toBeCloseTo(takeHomeBreakdown(th, 'wy').net / 12, 6))
  it('is below gross monthly pay', () => expect(takeHomeMonthly(th, 'wy')).toBeLessThan(10000))
  it('is 0 with no salary', () => expect(takeHomeMonthly({ salary: 0, deductions: [] }, 'wy')).toBe(0))
})

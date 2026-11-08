import { takeHome401kMatchYearly } from './takeHome401kMatchYearly'
import type { Deduction } from '@/shared/types/Deduction'

describe('takeHome401kMatchYearly', () => {
  const ded = (o: Pick<Deduction, 'kind'> & Partial<Deduction>): Deduction => ({ id: o.kind, unit: 'pct', amount: 5, ...o })
  it('applies each match percent to the 401k contribution', () => {
    const th = { salary: 100000, deductions: [ded({ kind: '401k', match: 50 }), ded({ kind: 'roth401k', match: 100 })] }
    expect(takeHome401kMatchYearly(th)).toBe(2500 + 5000)
  })
  it('ignores other kinds and missing matches', () => {
    const th = { salary: 100000, deductions: [ded({ kind: 'hsa', match: 100 }), ded({ kind: '401k' })] }
    expect(takeHome401kMatchYearly(th)).toBe(0)
  })
  it('matches only what fits under the yearly 401k limit', () => {
    const th = { salary: 400000, deductions: [ded({ kind: '401k', amount: 10, match: 100 })] }
    expect(takeHome401kMatchYearly(th)).toBe(24500)
  })
  it('is 0 with no salary', () => expect(takeHome401kMatchYearly({ salary: 0, deductions: [ded({ kind: '401k', match: 100 })] })).toBe(0))
})

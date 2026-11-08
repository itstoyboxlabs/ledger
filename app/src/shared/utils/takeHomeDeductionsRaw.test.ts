import { takeHomeDeductionsRaw } from './takeHomeDeductionsRaw'
import type { Deduction } from '@/shared/types/Deduction'

describe('takeHomeDeductionsRaw', () => {
  it('returns the stored list untouched', () => {
    const ds: Deduction[] = [{ id: 'x', kind: 'hsa', unit: 'mo', amount: 1 }]
    expect(takeHomeDeductionsRaw({ deductions: ds })).toBe(ds)
  })
  it('builds defaults for old saves', () =>
    expect(takeHomeDeductionsRaw({})).toEqual([
      { id: 'd401k', kind: '401k', unit: 'pct', amount: 4 },
      { id: 'dmed', kind: 'insurance', unit: 'mo', amount: 150 },
    ]))
  it('uses the old fields when present', () => {
    const r = takeHomeDeductionsRaw({ k401Pct: 8, medicalMo: 0 })
    expect(r[0].amount).toBe(8)
    expect(r[1].amount).toBe(0)
  })
})

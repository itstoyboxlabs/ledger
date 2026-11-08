import { taxOn } from '@/shared/utils/taxOn'
import { takeHomeBreakdown } from './takeHomeBreakdown'
import type { RawTakeHome } from '@/shared/types/RawTakeHome'

const th: RawTakeHome = {
  salary: 100000,
  deductions: [
    { id: 'a', kind: '401k', unit: 'pct', amount: 10 },
    { id: 'b', kind: 'insurance', unit: 'mo', amount: 200 },
    { id: 'c', kind: 'dues', unit: 'yr', amount: 600 },
  ],
}

describe('takeHomeBreakdown', () => {
  it('computes yearly amounts per deduction', () =>
    expect(takeHomeBreakdown(th, 'wy').lines.map((l) => l.yearly)).toEqual([10000, 2400, 600]))
  it('applies pre-tax rules: 401k skips income tax only, insurance skips FICA too', () => {
    const r = takeHomeBreakdown(th, 'wy')
    const base = taxOn(100000 - 12400, 'wy')
    expect(r.fed).toBe(base.fed)
    expect(r.state).toBe(0)
    expect(r.fica).toBe(taxOn(100000 - 2400, 'wy').fica)
    expect(r.taxes).toBeCloseTo(base.fed + base.state + base.local + r.fica, 5)
    expect(r.net).toBeCloseTo(100000 - 12400 - 600 - r.taxes, 5)
  })
  it('with no deductions the net is salary minus all taxes', () => {
    const r = takeHomeBreakdown({ salary: 80000, deductions: [] }, 'wy')
    expect(r.net).toBeCloseTo(80000 - taxOn(80000, 'wy').total, 5)
  })
  it('is all zero for no salary', () => {
    const r = takeHomeBreakdown({ salary: '' as unknown as number, deductions: [] }, 'wy')
    expect(r).toMatchObject({ salary: 0, taxes: 0, net: 0 })
  })
  it('reads old saves with fixed fields', () => {
    const r = takeHomeBreakdown({ salary: 100000, k401Pct: 5, medicalMo: 100 }, 'wy')
    expect(r.lines.map((l) => l.yearly)).toEqual([5000, 1200])
  })
})

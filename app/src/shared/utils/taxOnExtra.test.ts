import { taxOn } from './taxOn'
import { taxOnExtra } from './taxOnExtra'

describe('taxOnExtra', () => {
  it('is the difference of total tax with and without the extra', () => {
    const got = taxOnExtra(100000, 50000, 'ny')
    expect(got.total).toBeCloseTo(taxOn(150000, 'ny').total - taxOn(100000, 'ny').total, 8)
    expect(got.effective).toBeCloseTo(got.total / 50000, 10)
  })
  it('is zero for zero extra', () => {
    expect(taxOnExtra(100000, 0, 'ny')).toEqual({ total: 0, effective: 0 })
  })
  it('stays between 0 and 100 percent in a no-tax state', () => {
    const got = taxOnExtra(100000, 50000, 'tx')
    expect(got.effective).toBeGreaterThan(0)
    expect(got.effective).toBeLessThan(1)
  })
  it('a state with income tax takes a bigger bite', () => {
    expect(taxOnExtra(100000, 50000, 'ny').total).toBeGreaterThan(taxOnExtra(100000, 50000, 'tx').total)
  })
  it('taxes extra at a higher rate on a higher base', () => {
    expect(taxOnExtra(200000, 50000, 'tx').effective).toBeGreaterThan(taxOnExtra(30000, 50000, 'tx').effective)
  })
})

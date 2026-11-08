import { ltcgOnExtra } from './ltcgOnExtra'
import { ltcgFederal } from './ltcgFederal'

describe('ltcgOnExtra', () => {
  it('is all zeros for no or negative gain', () => {
    const zero = { total: 0, effective: 0, fed: 0, niit: 0, state: 0 }
    expect(ltcgOnExtra(100000, 0, 'ny')).toEqual(zero)
    expect(ltcgOnExtra(100000, -1, 'ny')).toEqual(zero)
  })
  it('is just the federal piece in a no-tax state', () => {
    const got = ltcgOnExtra(100000, 50000, 'tx')
    expect(got.state).toBe(0)
    expect(got.total).toBeCloseTo(ltcgFederal(100000, 50000).total, 8)
    expect(got.fed).toBeCloseTo(7500, 5)
  })
  it('adds state tax where one exists', () => {
    const ny = ltcgOnExtra(100000, 50000, 'ny')
    const tx = ltcgOnExtra(100000, 50000, 'tx')
    expect(ny.state).toBeGreaterThan(0)
    expect(ny.total).toBeGreaterThan(tx.total)
  })
  it('reports the effective rate as total over gain', () => {
    const got = ltcgOnExtra(100000, 50000, 'ny')
    expect(got.effective).toBeCloseTo(got.total / 50000, 10)
  })
  it('includes NIIT for high earners', () => {
    expect(ltcgOnExtra(250000, 100000, 'tx').niit).toBeCloseTo(3800, 5)
  })
})

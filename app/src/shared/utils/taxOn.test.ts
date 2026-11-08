import { taxOn } from './taxOn'

describe('taxOn', () => {
  it('is all zeros for zero or negative income', () => {
    const zero = { total: 0, effective: 0, fed: 0, fica: 0, state: 0, local: 0 }
    expect(taxOn(0, 'ny')).toEqual(zero)
    expect(taxOn(-100, 'ny')).toEqual(zero)
  })
  it('matches a hand computed federal and FICA figure in a no-tax state', () => {
    // taxable 84,250: 12,400*10% + 38,000*12% + 33,850*22% = 13,247
    const t = taxOn(100000, 'wy')
    expect(t.fed).toBeCloseTo(13247, 5)
    expect(t.fica).toBeCloseTo(7650, 5)
    expect(t.state).toBe(0)
    expect(t.local).toBe(0)
    expect(t.total).toBeCloseTo(13247 + 7650, 5)
    expect(t.effective).toBeCloseTo(t.total / 100000, 10)
  })
  it('has no state portion for tx and wy', () => {
    expect(taxOn(250000, 'tx').state).toBe(0)
    expect(taxOn(250000, 'wy').state).toBe(0)
    expect(taxOn(250000, 'tx').total).toBe(taxOn(250000, 'wy').total)
  })
  it('taxes more income more', () => {
    expect(taxOn(150000, 'ny').total).toBeGreaterThan(taxOn(100000, 'ny').total)
    expect(taxOn(100000, 'ny').total).toBeGreaterThan(taxOn(50000, 'ny').total)
  })
  it('charges a state with income tax more than a no-tax state', () => {
    expect(taxOn(100000, 'ny').state).toBeGreaterThan(0)
    expect(taxOn(100000, 'ny').total).toBeGreaterThan(taxOn(100000, 'tx').total)
  })
  it('falls back to Tennessee (no state tax) for an unknown state', () => {
    expect(taxOn(100000, 'zz')).toEqual(taxOn(100000, 'tn'))
  })
  it('only charges federal tax over the standard deduction', () => {
    expect(taxOn(15000, 'wy').fed).toBe(0)
  })
  it('adds local tax for Maryland', () => {
    expect(taxOn(100000, 'md').local).toBeGreaterThan(0)
  })
})

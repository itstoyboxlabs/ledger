import { taxOn } from './taxOn'

describe('taxOn', () => {
  it('is all zeros for zero or negative income', () => {
    const zero = { total: 0, effective: 0, fed: 0, fica: 0, state: 0, local: 0 }
    expect(taxOn(0, 'ny')).toEqual(zero)
    expect(taxOn(-100, 'ny')).toEqual(zero)
  })
  it('matches a hand computed federal and FICA figure in a no-tax state', () => {
    // taxable 83,900: 12,400*10% + 38,000*12% + 33,500*22% = 13,170
    const t = taxOn(100000, 'wy')
    expect(t.fed).toBeCloseTo(13170, 5)
    expect(t.fica).toBeCloseTo(7650, 5)
    expect(t.state).toBe(0)
    expect(t.local).toBe(0)
    expect(t.total).toBeCloseTo(13170 + 7650, 5)
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
    expect(taxOn(16100, 'wy').fed).toBe(0)
    expect(taxOn(16200, 'wy').fed).toBeCloseTo(10, 5)
  })
  it('adds local tax for Maryland', () => {
    expect(taxOn(100000, 'md').local).toBeGreaterThan(0)
  })
})

describe('taxOn by filing status', () => {
  const STATE_KEYS = ['tx', 'wy', 'ca', 'ny', 'ny-nyc', 'az', 'co', 'md', 'il', 'zz']
  const INCOMES = [0, 1, 16100, 50000, 100000, 184500, 200001, 250000, 300000, 750000, 2000000]
  it('single results are unchanged: no filing status is the same as single', () => {
    for (const s of STATE_KEYS) for (const g of INCOMES) expect(taxOn(g, s, 'single')).toEqual(taxOn(g, s))
  })
  it('keeps the single figures worked out by hand', () => {
    // taxable 283,900 single: 1,240 + 4,560 + 12,166 + 23,058 + 17,424 + 9,686.25
    const t = taxOn(300000, 'wy')
    expect(t.fed).toBeCloseTo(68134.25, 5)
    // 0.062 x 184,500 + 0.0145 x 300,000 + 0.009 x 100,000
    expect(t.fica).toBeCloseTo(16689, 5)
  })
  it('uses the 2026 joint brackets and the 32,200 standard deduction', () => {
    // taxable 67,800: 24,800 x 10% + 43,000 x 12%
    expect(taxOn(100000, 'wy', 'mfj').fed).toBeCloseTo(7640, 5)
    // taxable 267,800: 2,480 + 9,120 + 24,332 + 13,536
    expect(taxOn(300000, 'wy', 'mfj').fed).toBeCloseTo(49468, 5)
    expect(taxOn(32200, 'wy', 'mfj').fed).toBe(0)
    expect(taxOn(32300, 'wy', 'mfj').fed).toBeCloseTo(10, 5)
  })
  it('moves Additional Medicare to 250k for joint filers', () => {
    expect(taxOn(300000, 'wy', 'mfj').fica).toBeCloseTo(16239, 5)
  })
  it('gives joint filers the joint deduction in a state that follows the federal one', () => {
    expect(taxOn(100000, 'az', 'mfj').state).toBeCloseTo((100000 - 32200) * 0.025, 5)
    expect(taxOn(100000, 'az').state).toBeCloseTo((100000 - 16100) * 0.025, 5)
  })
  it('keeps the single state brackets everywhere else', () => {
    expect(taxOn(100000, 'ca', 'mfj').state).toBe(taxOn(100000, 'ca').state)
    expect(taxOn(100000, 'ny-nyc', 'mfj').local).toBe(taxOn(100000, 'ny-nyc').local)
  })
  it('never taxes a joint filer more than a single filer on the same income', () => {
    for (const s of STATE_KEYS) for (const g of INCOMES) expect(taxOn(g, s, 'mfj').total).toBeLessThanOrEqual(taxOn(g, s).total + 1e-9)
  })
})

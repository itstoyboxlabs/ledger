import { ltcgOnExtra } from '@/shared/utils/ltcgOnExtra'
import { taxOnExtra } from '@/shared/utils/taxOnExtra'
import { incomeTaxOnExtra } from '@/shared/utils/incomeTaxOnExtra'
import { equityPayout } from './equityPayout'
import type { StockInputs } from '@/shared/types/StockInputs'

const rsu: StockInputs = { type: 'rsu', exit: 50, strike: 10, shares: 1000, years: 2, salary: 100000, heldOver: false }

describe('equityPayout', () => {
  it('values RSUs at the full exit price and spreads over years', () => {
    const r = equityPayout(rsu, 'wy')
    expect(r).toMatchObject({ delta: 50, gross: 50000, years: 2, slice: 25000, longTerm: false })
    expect(r.tax.total).toBe(taxOnExtra(100000, 25000, 'wy').total)
    expect(r.net).toBeCloseTo((25000 - r.tax.total) * 2, 5)
  })
  it('values options at exit minus strike', () => expect(equityPayout({ ...rsu, type: 'nso' }, 'wy').delta).toBe(40))
  it('is zero when options are underwater', () => {
    const r = equityPayout({ ...rsu, type: 'iso', exit: 5 }, 'wy')
    expect(r.delta).toBe(0)
    expect(r.gross).toBe(0)
    expect(r.net).toBe(0)
  })
  it('uses capital gains tax for ISOs held long enough', () => {
    const r = equityPayout({ ...rsu, type: 'iso', heldOver: true }, 'wy')
    expect(r.longTerm).toBe(true)
    expect(r.tax.total).toBe(ltcgOnExtra(100000, 20000, 'wy').total)
    expect(r.tax.total).toBeLessThan(equityPayout({ ...rsu, type: 'iso' }, 'wy').tax.total)
  })
  it('taxes ISOs sold too soon as income with no FICA, NSOs with FICA', () => {
    const iso = equityPayout({ ...rsu, type: 'iso' }, 'wy')
    const nso = equityPayout({ ...rsu, type: 'nso' }, 'wy')
    expect(iso.longTerm).toBe(false)
    expect(iso.tax.total).toBe(incomeTaxOnExtra(100000, 20000, 'wy').total)
    expect(nso.tax.total).toBe(taxOnExtra(100000, 20000, 'wy').total)
    expect(iso.tax.total).toBeLessThan(nso.tax.total)
  })
  it('treats years below 1 as 1', () => expect(equityPayout({ ...rsu, years: 0 }, 'wy')).toMatchObject({ years: 1, slice: 50000 }))
})

describe('equityPayout by filing status', () => {
  const iso: StockInputs = { ...rsu, type: 'iso', heldOver: true }
  it('is unchanged for single filers', () => {
    for (const c of [rsu, iso, { ...iso, heldOver: false }]) expect(equityPayout(c, 'ny', 'single')).toEqual(equityPayout(c, 'ny'))
  })
  it('taxes each kind on the joint tables', () => {
    expect(equityPayout(rsu, 'wy', 'mfj').tax).toEqual(taxOnExtra(100000, 25000, 'wy', 'mfj'))
    expect(equityPayout(iso, 'wy', 'mfj').tax).toEqual(ltcgOnExtra(100000, 20000, 'wy', 'mfj'))
    expect(equityPayout({ ...iso, heldOver: false }, 'wy', 'mfj').tax).toEqual(incomeTaxOnExtra(100000, 20000, 'wy', 'mfj'))
  })
})

import { incomeTaxOnExtra } from './incomeTaxOnExtra'
import { taxOn } from '@/shared/utils/taxOn'
import { taxOnExtra } from '@/shared/utils/taxOnExtra'

describe('incomeTaxOnExtra', () => {
  it('is the income tax difference with no FICA', () => {
    const a = taxOn(120000, 'ny')
    const b = taxOn(100000, 'ny')
    const got = incomeTaxOnExtra(100000, 20000, 'ny')
    expect(got.total).toBeCloseTo(a.fed + a.state + a.local - (b.fed + b.state + b.local), 8)
    expect(got.effective).toBeCloseTo(got.total / 20000, 10)
  })
  it('is less than taxOnExtra by the FICA on the extra', () => {
    const fica = taxOn(120000, 'wy').fica - taxOn(100000, 'wy').fica
    expect(fica).toBeGreaterThan(0)
    expect(incomeTaxOnExtra(100000, 20000, 'wy').total).toBeCloseTo(taxOnExtra(100000, 20000, 'wy').total - fica, 8)
  })
  it('is zero for no extra', () => expect(incomeTaxOnExtra(100000, 0, 'ny')).toEqual({ total: 0, effective: 0 }))
})

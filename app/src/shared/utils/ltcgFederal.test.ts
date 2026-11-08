import { ltcgFederal } from './ltcgFederal'

describe('ltcgFederal', () => {
  it('is zero for no or negative gain', () => {
    expect(ltcgFederal(100000, 0)).toEqual({ fed: 0, niit: 0, total: 0 })
    expect(ltcgFederal(100000, -500)).toEqual({ fed: 0, niit: 0, total: 0 })
  })
  it('is 0% when gains fit in the zero band', () => {
    expect(ltcgFederal(0, 10000)).toEqual({ fed: 0, niit: 0, total: 0 })
  })
  it('is 15% when stacked above the zero band', () => {
    // ordinary income after deduction is 84,250, so all 50,000 is taxed at 15%
    const got = ltcgFederal(100000, 50000)
    expect(got.fed).toBeCloseTo(7500, 5)
    expect(got.niit).toBe(0)
    expect(got.total).toBeCloseTo(7500, 5)
  })
  it('splits a gain across the 0% and 15% bands', () => {
    // ordinary 0, gain 100,000: first 49,450 at 0%, remaining 50,550 at 15%
    expect(ltcgFederal(15750, 100000).fed).toBeCloseTo(0.15 * 50550, 5)
  })
  it('adds 3.8% NIIT on income over 200k', () => {
    const got = ltcgFederal(250000, 100000)
    expect(got.niit).toBeCloseTo(0.038 * 100000, 5)
    expect(got.total).toBeCloseTo(got.fed + got.niit, 8)
  })
  it('applies NIIT only to the part over the threshold', () => {
    expect(ltcgFederal(150000, 100000).niit).toBeCloseTo(0.038 * 50000, 5)
  })
  it('uses 20% above the 15% band', () => {
    expect(ltcgFederal(1000000, 100000).fed).toBeCloseTo(20000, 5)
  })
})

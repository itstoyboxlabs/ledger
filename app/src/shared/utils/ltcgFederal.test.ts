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
    // ordinary income after deduction is 83,900, so all 50,000 is taxed at 15%
    const got = ltcgFederal(100000, 50000)
    expect(got.fed).toBeCloseTo(7500, 5)
    expect(got.niit).toBe(0)
    expect(got.total).toBeCloseTo(7500, 5)
  })
  it('splits a gain across the 0% and 15% bands', () => {
    // ordinary 0, gain 100,000: first 49,450 at 0%, remaining 50,550 at 15%
    expect(ltcgFederal(16100, 100000).fed).toBeCloseTo(0.15 * 50550, 5)
  })
  it('lets the unused standard deduction shelter the gain', () => {
    expect(ltcgFederal(0, 50000)).toEqual({ fed: 0, niit: 0, total: 0 })
    // taxable is 70,000 - 16,100 = 53,900, so 4,450 sits above the 0% band
    expect(ltcgFederal(0, 70000).fed).toBeCloseTo(0.15 * 4450, 5)
    expect(ltcgFederal(10000, 60000).fed).toBeCloseTo(0.15 * 4450, 5)
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

describe('ltcgFederal by filing status', () => {
  it('is unchanged for single filers', () => {
    for (const [b, g] of [[0, 10000], [100000, 50000], [180000, 60000], [500000, 200000]]) expect(ltcgFederal(b, g, 'single')).toEqual(ltcgFederal(b, g))
  })
  it('uses the 98,900 joint zero band', () => {
    // ordinary income after the 32,200 deduction is 67,800, so 31,100 of the gain is at 0%
    // and the other 18,900 at 15%
    expect(ltcgFederal(100000, 50000, 'mfj')).toEqual({ fed: 0.15 * 18900, niit: 0, total: 0.15 * 18900 })
  })
  it('starts the investment income tax at 250k for joint filers', () => {
    expect(ltcgFederal(240000, 20000, 'mfj').niit).toBeCloseTo(0.038 * 10000, 8)
    expect(ltcgFederal(240000, 20000).niit).toBeCloseTo(0.038 * 20000, 8)
  })
  it('uses 20% above 613,700 for joint filers', () => {
    const r = ltcgFederal(700000, 10000, 'mfj')
    expect(r.fed).toBeCloseTo(0.2 * 10000, 8)
  })
})

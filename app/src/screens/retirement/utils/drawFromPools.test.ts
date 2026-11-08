import { drawFromPools } from './drawFromPools'

const flat20 = (g: number) => g * 0.2

describe('drawFromPools', () => {
  it('takes nothing when nothing is needed', () => {
    expect(drawFromPools(0, 1000, 1000, flat20)).toEqual({ pretax: 0, roth: 0, tax: 0, short: 0 })
  })

  it('grosses up a pre-tax draw so the tax is paid too', () => {
    const d = drawFromPools(8000, 100000, 50000, flat20)
    expect(d.pretax).toBeCloseTo(10000, 1)
    expect(d.tax).toBeCloseTo(2000, 1)
    expect(d.roth).toBe(0)
    expect(d.short).toBe(0)
  })

  it('empties the pre-tax pool, then takes the rest from Roth untaxed', () => {
    // 5,000 pre-tax nets 4,000, so Roth covers the other 4,000
    expect(drawFromPools(8000, 5000, 50000, flat20)).toEqual({ pretax: 5000, roth: 4000, tax: 1000, short: 0 })
  })

  it('uses Roth alone when there is no pre-tax money', () => {
    expect(drawFromPools(8000, 0, 50000, flat20)).toEqual({ pretax: 0, roth: 8000, tax: 0, short: 0 })
  })

  it('reports what is still missing once both are empty', () => {
    expect(drawFromPools(8000, 5000, 1000, flat20)).toEqual({ pretax: 5000, roth: 1000, tax: 1000, short: 3000 })
    expect(drawFromPools(8000, 0, 0, flat20).short).toBe(8000)
  })
})

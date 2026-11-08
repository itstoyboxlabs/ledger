import { grossUp } from './grossUp'
import { incomeTaxOnExtra } from '@/shared/utils/incomeTaxOnExtra'

const flat20 = (g: number) => g * 0.2
const texas = (g: number) => incomeTaxOnExtra(0, g, 'tx').total

describe('grossUp', () => {
  it('is zero for nothing', () => expect(grossUp(0, flat20)).toBe(0))

  it('solves a flat rate exactly enough', () => {
    expect(grossUp(8000, flat20)).toBeCloseTo(10000, 1)
  })

  it('needs no extra under the standard deduction', () => {
    expect(grossUp(12000, texas)).toBe(12000)
  })

  it('leaves the net after the real progressive tax', () => {
    for (const net of [30000, 60000, 150000, 400000]) {
      const g = grossUp(net, texas)
      expect(g - texas(g)).toBeCloseTo(net, 1)
    }
  })

  it('takes a bigger share in tax as the amount grows', () => {
    const rate = (net: number) => 1 - net / grossUp(net, texas)
    expect(rate(150000)).toBeGreaterThan(rate(60000))
    expect(rate(60000)).toBeGreaterThan(rate(30000))
  })

  it('stops at the cap', () => {
    expect(grossUp(8000, flat20, 5000)).toBe(5000)
  })
})

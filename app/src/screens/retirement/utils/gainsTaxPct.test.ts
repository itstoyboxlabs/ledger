import { gainsTaxPct } from './gainsTaxPct'
import { taxOn } from '@/shared/utils/taxOn'

describe('gainsTaxPct', () => {
  it('is zero with no income in a no-tax state', () => {
    expect(gainsTaxPct(0, 'wy')).toBe(0)
  })
  it('uses 0% federal under the threshold in a no-income-tax state', () => {
    expect(gainsTaxPct(40000, 'wy')).toBe(0)
  })
  it('takes the standard deduction off before picking the federal band', () => {
    expect(gainsTaxPct(60000, 'tx')).toBe(0)
    expect(gainsTaxPct(65000, 'tx')).toBe(0)
    expect(gainsTaxPct(66000, 'tx')).toBe(15)
    expect(gainsTaxPct(560000, 'tx')).toBe(15)
  })
  it('uses 15% federal in the middle band in a no-income-tax state', () => {
    expect(gainsTaxPct(100000, 'wy')).toBe(15)
  })
  it('uses 20% federal above the top threshold in a no-income-tax state', () => {
    expect(gainsTaxPct(600000, 'wy')).toBe(20)
  })
  it('adds the state effective rate and rounds to one decimal', () => {
    const inc = 100000
    const t = taxOn(inc, 'ny')
    const expected = Math.round((0.15 + (t.state + t.local) / inc) * 1000) / 10
    expect(gainsTaxPct(inc, 'ny')).toBe(expected)
    expect(gainsTaxPct(inc, 'ny')).toBeGreaterThan(15)
    expect(Number.isInteger(gainsTaxPct(inc, 'ny') * 10)).toBe(true)
  })
})

describe('gainsTaxPct by filing status', () => {
  it('is unchanged for single filers', () => {
    for (const g of [0, 40000, 60000, 100000, 600000]) expect(gainsTaxPct(g, 'ny', 'single')).toBe(gainsTaxPct(g, 'ny'))
  })
  it('uses the joint zero band after the joint deduction', () => {
    // taxable 67,800 is under 98,900 for joint filers, but 83,900 is over 49,450 single
    expect(gainsTaxPct(100000, 'wy', 'mfj')).toBe(0)
    expect(gainsTaxPct(100000, 'wy')).toBe(15)
    expect(gainsTaxPct(200000, 'wy', 'mfj')).toBe(15)
  })
})

import { itemMonthly } from './itemMonthly'

describe('itemMonthly', () => {
  it('returns the flat amount in month mode', () => expect(itemMonthly({ mode: 'month', amount: 40 })).toBe(40))
  it('multiplies by times a week and 4 in week mode', () =>
    expect(itemMonthly({ mode: 'week', amount: 12.5, perWeek: 2 })).toBe(100))
  it('treats bad numbers as zero', () => {
    expect(itemMonthly({ mode: 'week', amount: 10 })).toBe(0)
    expect(itemMonthly({ mode: 'month', amount: 'x' as unknown as number })).toBe(0)
  })
  it('keeps negative amounts', () => expect(itemMonthly({ amount: -5 })).toBe(-5))
})

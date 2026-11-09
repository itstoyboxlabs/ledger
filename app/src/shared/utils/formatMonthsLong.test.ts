import { formatMonthsLong } from './formatMonthsLong'

describe('formatMonthsLong', () => {
  it('says months under a year', () => {
    expect(formatMonthsLong(0)).toBe('0 months')
    expect(formatMonthsLong(1)).toBe('1 month')
    expect(formatMonthsLong(5)).toBe('5 months')
  })
  it('says whole years without months', () => {
    expect(formatMonthsLong(12)).toBe('1 year')
    expect(formatMonthsLong(36)).toBe('3 years')
  })
  it('says years and months', () => {
    expect(formatMonthsLong(13)).toBe('1 year 1 month')
    expect(formatMonthsLong(74)).toBe('6 years 2 months')
  })
})

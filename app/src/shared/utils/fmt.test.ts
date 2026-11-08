import { fmt } from './fmt'

describe('fmt', () => {
  it('formats with a dollar sign and two decimals', () => {
    expect(fmt(1234.5)).toBe('$1,234.50')
    expect(fmt(0)).toBe('$0.00')
  })
  it('rounds to cents', () => {
    expect(fmt(2.345)).toBe('$2.35')
    expect(fmt(0.004)).toBe('$0.00')
  })
  it('puts a true minus sign before the dollar sign for negatives', () => {
    expect(fmt(-5)).toBe('−$5.00')
    expect(fmt(-1234567.891)).toBe('−$1,234,567.89')
  })
  it('never shows a minus sign on a value that rounds to zero', () => {
    expect(fmt(-0.004)).toBe('$0.00')
    expect(fmt(0.1 + 0.2 - 0.3 - 1e-12)).toBe('$0.00')
  })
  it('adds thousands separators', () => {
    expect(fmt(1000000)).toBe('$1,000,000.00')
  })
})

import { payoffMonths } from './payoffMonths'

describe('payoffMonths', () => {
  it('is 0 when nothing is owed', () => {
    expect(payoffMonths(0, 100, 5)).toBe(0)
    expect(payoffMonths(-50, 100, 5)).toBe(0)
  })
  it('is null with no payment', () => {
    expect(payoffMonths(1000, 0, 0)).toBeNull()
    expect(payoffMonths(1000, -5, 0)).toBeNull()
    expect(payoffMonths(1000, NaN, 0)).toBeNull()
  })
  it('rounds up with no interest', () => {
    expect(payoffMonths(1000, 100, 0)).toBe(10)
    expect(payoffMonths(1001, 100, 0)).toBe(11)
  })
  it('is null when the payment only covers interest', () => {
    expect(payoffMonths(12000, 100, 12)).toBeNull()
    expect(payoffMonths(12000, 50, 12)).toBeNull()
  })
  it('uses amortization with interest', () => {
    // 1000 at 12% APR, 100/mo: about 11 months
    expect(payoffMonths(1000, 100, 12)).toBe(11)
  })
  it('takes longer with higher APR', () => {
    expect(payoffMonths(5000, 200, 25) as number).toBeGreaterThan(payoffMonths(5000, 200, 5) as number)
  })
})

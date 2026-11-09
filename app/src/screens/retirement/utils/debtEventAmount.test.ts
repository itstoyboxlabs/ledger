import { debtEventAmount } from './debtEventAmount'

describe('debtEventAmount', () => {
  it('is today\'s balance with no APR, whenever the event is', () => {
    expect(debtEventAmount(6000, 200, 0, 36)).toBe(6000)
    expect(debtEventAmount(6000, 0, 0, 120)).toBe(6000)
  })
  it('is today\'s balance when the payment covers the interest', () => {
    // 12% of 6,000 is 60 a month in interest, and 200 covers it
    expect(debtEventAmount(6000, 200, 12, 36)).toBe(6000)
    expect(debtEventAmount(6000, 60, 12, 36)).toBe(6000)
  })
  it('adds the interest the payment leaves unpaid', () => {
    // 12,000 at 12% with 100 a month: 20 a month is left unpaid and grows at 1% a month
    const grow = 1.01 ** 12
    expect(debtEventAmount(12000, 100, 12, 12)).toBeCloseTo(12000 * grow - 100 * (grow - 1) / 0.01, 6)
    expect(debtEventAmount(12000, 100, 12, 12)).toBeGreaterThan(12000)
  })
  it('compounds the whole balance with no payment', () => {
    expect(debtEventAmount(1000, 0, 12, 24)).toBeCloseTo(1000 * 1.01 ** 24, 6)
  })
  it('is today\'s balance for an event this year', () => {
    expect(debtEventAmount(12000, 0, 12, 0)).toBe(12000)
  })
  it('is 0 for a cleared debt', () => {
    expect(debtEventAmount(0, 100, 12, 12)).toBe(0)
  })
})

import { rollingPayoff } from './rollingPayoff'
import { payoffMonths } from './payoffMonths'

const d = (balance: number, apr: number, payment: number) => ({ balance, apr, payment })

describe('rollingPayoff', () => {
  it('one debt matches the single debt payoff time', () => {
    const r = rollingPayoff([d(3000, 12, 150)], 150)
    expect(r.months).toEqual([payoffMonths(3000, 150, 12)])
    expect(r.total).toBe(payoffMonths(3000, 150, 12))
  })
  it('with no interest it is the balances over the money, rounded up', () => {
    expect(rollingPayoff([d(1000, 0, 100), d(500, 0, 50)], 150).total).toBe(10)
  })
  it('the first debt gets the extra, then its payment rolls to the next', () => {
    // 150 a month: debt A 300 (pays 100), debt B 300 (pays 50). A gets 100 + 0 extra... total 150, A 100, B 50.
    // month 3: A clears. B then gets the whole 150.
    const r = rollingPayoff([d(300, 0, 100), d(300, 0, 50)], 150)
    expect(r.months[0]).toBe(3)
    // B has 150 left after 3 months, then 150 a month
    expect(r.months[1]).toBe(4)
  })
  it('the order decides who clears first', () => {
    expect(rollingPayoff([d(1000, 0, 0), d(2000, 0, 0)], 500).months).toEqual([2, 6])
    expect(rollingPayoff([d(2000, 0, 0), d(1000, 0, 0)], 500).months).toEqual([4, 6])
  })
  it('rolling clears the whole stack sooner than separate payments', () => {
    const rolled = rollingPayoff([d(1000, 20, 50), d(5000, 5, 100)], 150).total as number
    const apart = Math.max(payoffMonths(1000, 50, 20) as number, payoffMonths(5000, 100, 5) as number)
    expect(rolled).toBeLessThan(apart)
  })
  it('a payment that never covers the interest never clears', () => {
    const r = rollingPayoff([d(100000, 20, 100)], 100)
    expect(r.months).toEqual([null])
    expect(r.total).toBeNull()
  })
  it('a debt with nothing owed is 0 months', () => {
    expect(rollingPayoff([d(0, 5, 100)], 100)).toEqual({ months: [0], total: 0, spent: [] })
  })
  it('puts money into a debt with no payment of its own', () => {
    expect(rollingPayoff([d(1000, 0, 0)], 250).total).toBe(4)
  })
  it('with no money nothing clears', () => {
    expect(rollingPayoff([d(1000, 0, 100)], 0).total).toBeNull()
  })
  it('spends the whole amount each month except the last', () => {
    // 1000 at 400 a month: 400, 400, then the last 200
    expect(rollingPayoff([d(1000, 0, 400)], 400).spent).toEqual([400, 400, 200])
  })
})

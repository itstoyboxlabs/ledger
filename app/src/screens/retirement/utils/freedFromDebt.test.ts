import { freedFromDebt } from './freedFromDebt'

const sched = { payoffAge: 32, freedMonthsInPayoffYear: 5 }

describe('freedFromDebt', () => {
  it('frees nothing before the payoff age', () => {
    expect(freedFromDebt(sched, 200, 31)).toBe(0)
  })
  it('frees the leftover months in the payoff year', () => {
    expect(freedFromDebt(sched, 200, 32)).toBe(1000)
  })
  it('frees a full year after that', () => {
    expect(freedFromDebt(sched, 200, 33)).toBe(2400)
  })
  it('frees nothing without a payment', () => {
    expect(freedFromDebt(sched, 0, 40)).toBe(0)
  })
})

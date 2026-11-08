import { debtPayoffSchedule } from './debtPayoffSchedule'

describe('debtPayoffSchedule', () => {
  it('treats a cleared debt as paid off the year before', () => {
    expect(debtPayoffSchedule(0, 100, 30)).toEqual({ payoffAge: 29, freedMonthsInPayoffYear: 12 })
  })
  it('never clears a debt with no payment', () => {
    expect(debtPayoffSchedule(1000, 0, 30)).toEqual({ payoffAge: Infinity, freedMonthsInPayoffYear: 0 })
  })
  it('frees the rest of the year once the last payment is made', () => {
    // 3 payments: paid off in the first year with 9 months freed
    expect(debtPayoffSchedule(300, 100, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 9 })
  })
  it('rounds a partial last payment up to a whole month', () => {
    expect(debtPayoffSchedule(250, 100, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 9 })
  })
  it('lands in a later year for a longer payoff', () => {
    // 12 payments end the first year with nothing freed, 13 spill into the next
    expect(debtPayoffSchedule(1200, 100, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 0 })
    expect(debtPayoffSchedule(1300, 100, 30)).toEqual({ payoffAge: 31, freedMonthsInPayoffYear: 11 })
  })
})

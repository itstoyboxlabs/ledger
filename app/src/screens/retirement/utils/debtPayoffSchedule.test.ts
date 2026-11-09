import { debtPayoffSchedule } from './debtPayoffSchedule'
import { payoffMonths } from '@/shared/utils/payoffMonths'

describe('debtPayoffSchedule', () => {
  describe('with no APR (the numbers from before interest was counted)', () => {
    it('treats a cleared debt as paid off the year before', () => {
      expect(debtPayoffSchedule(0, 100, 0, 30)).toEqual({ payoffAge: 29, freedMonthsInPayoffYear: 12 })
    })
    it('never clears a debt with no payment', () => {
      expect(debtPayoffSchedule(1000, 0, 0, 30)).toEqual({ payoffAge: Infinity, freedMonthsInPayoffYear: 0 })
    })
    it('frees the rest of the year once the last payment is made', () => {
      // 3 payments: paid off in the first year with 9 months freed
      expect(debtPayoffSchedule(300, 100, 0, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 9 })
    })
    it('rounds a partial last payment up to a whole month', () => {
      expect(debtPayoffSchedule(250, 100, 0, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 9 })
    })
    it('lands in a later year for a longer payoff', () => {
      // 12 payments end the first year with nothing freed, 13 spill into the next
      expect(debtPayoffSchedule(1200, 100, 0, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 0 })
      expect(debtPayoffSchedule(1300, 100, 0, 30)).toEqual({ payoffAge: 31, freedMonthsInPayoffYear: 11 })
    })
    it('pins the old balance over payment numbers', () => {
      // the e2e cases: 1,000 at 250 (4 months) and 2,400 at 200 (12 months), and a 6,000 card at 200 (30 months)
      expect(debtPayoffSchedule(1000, 250, 0, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 8 })
      expect(debtPayoffSchedule(2400, 200, 0, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 0 })
      expect(debtPayoffSchedule(6000, 200, 0, 30)).toEqual({ payoffAge: 32, freedMonthsInPayoffYear: 6 })
    })
  })

  describe('with an APR', () => {
    it('takes longer than balance over payment', () => {
      // 1,000 at 250 a month is 4 months with no interest and 5 at 12%
      expect(debtPayoffSchedule(1000, 250, 12, 30)).toEqual({ payoffAge: 30, freedMonthsInPayoffYear: 7 })
      // 2,400 at 200 is 12 months with no interest and 13 at 12%, so it moves into the next year
      expect(debtPayoffSchedule(2400, 200, 12, 30)).toEqual({ payoffAge: 31, freedMonthsInPayoffYear: 11 })
    })
    it('uses the same months as the Debt payoff tool', () => {
      const months = payoffMonths(10000, 300, 18) as number
      const s = debtPayoffSchedule(10000, 300, 18, 30)
      expect((s.payoffAge - 30) * 12 + (12 - s.freedMonthsInPayoffYear)).toBe(months)
    })
    it('never clears when the payment does not cover the interest', () => {
      // 12% of 12,000 is 120 a month in interest
      expect(debtPayoffSchedule(12000, 100, 12, 30)).toEqual({ payoffAge: Infinity, freedMonthsInPayoffYear: 0 })
      expect(debtPayoffSchedule(12000, 120, 12, 30)).toEqual({ payoffAge: Infinity, freedMonthsInPayoffYear: 0 })
    })
  })
})

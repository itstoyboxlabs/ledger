import { payPeriodsPerYear } from './payPeriodsPerYear'

describe('payPeriodsPerYear', () => {
  it('reads weekly pay', () => expect(payPeriodsPerYear(['2026-10-02', '2026-10-09', '2026-10-16', '2026-10-23'])).toBe(52))
  it('reads biweekly pay', () => expect(payPeriodsPerYear(['2026-09-04', '2026-09-18', '2026-10-02', '2026-10-16'])).toBe(26))
  it('reads semi-monthly pay', () => expect(payPeriodsPerYear(['2026-09-15', '2026-09-30', '2026-10-15', '2026-10-31'])).toBe(24))
  it('reads monthly pay', () => expect(payPeriodsPerYear(['2026-08-28', '2026-09-28', '2026-10-28'])).toBe(12))
  it('uses the median gap so one odd gap does not decide', () =>
    expect(payPeriodsPerYear(['2026-07-03', '2026-07-17', '2026-07-31', '2026-08-28', '2026-09-11'])).toBe(26))
  it('ignores order and same-day duplicates', () =>
    expect(payPeriodsPerYear(['2026-10-16', '2026-10-02', '2026-10-02', '2026-09-18'])).toBe(26))
  it('falls back to semi-monthly with fewer than two paydays', () => {
    expect(payPeriodsPerYear([])).toBe(24)
    expect(payPeriodsPerYear(['2026-10-15'])).toBe(24)
    expect(payPeriodsPerYear(['2026-10-15', '2026-10-15'])).toBe(24)
  })
})

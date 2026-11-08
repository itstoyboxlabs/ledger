import { logDayLabel } from './logDayLabel'

describe('logDayLabel', () => {
  it('formats a date as month and day', () => expect(logDayLabel('2026-11-08')).toBe('Nov 8'))
  it('drops the leading zero', () => expect(logDayLabel('2026-01-05')).toBe('Jan 5'))
  it('handles the year ends', () => {
    expect(logDayLabel('2026-12-31')).toBe('Dec 31')
    expect(logDayLabel('2026-02-28')).toBe('Feb 28')
  })
})

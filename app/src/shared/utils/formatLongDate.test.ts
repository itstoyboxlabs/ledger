import { formatLongDate } from './formatLongDate'

describe('formatLongDate', () => {
  it('writes the month in words', () => {
    expect(formatLongDate('2026-10-31')).toBe('October 31, 2026')
    expect(formatLongDate('2025-01-01')).toBe('January 1, 2025')
  })
})

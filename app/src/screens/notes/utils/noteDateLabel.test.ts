import { noteDateLabel } from './noteDateLabel'

describe('noteDateLabel', () => {
  it('formats a timestamp as Mon D, YYYY', () => {
    expect(noteDateLabel(new Date(2026, 10, 8, 12).getTime())).toBe('Nov 8, 2026')
  })
  it('does not pad the day', () => {
    expect(noteDateLabel(new Date(2026, 0, 3, 12).getTime())).toBe('Jan 3, 2026')
  })
  it('handles the last day of the year', () => {
    expect(noteDateLabel(new Date(2025, 11, 31, 23, 30).getTime())).toBe('Dec 31, 2025')
  })
})

import { monthLabel } from './monthLabel'

describe('monthLabel', () => {
  it('formats a year-month as a short name and year', () => {
    expect(monthLabel('2026-10')).toBe('Oct 2026')
    expect(monthLabel('2026-01')).toBe('Jan 2026')
    expect(monthLabel('2026-12')).toBe('Dec 2026')
  })
  it('handles zero padded months', () => {
    expect(monthLabel('2025-05')).toBe('May 2025')
  })
  it('covers every month', () => {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    names.forEach((n, i) => expect(monthLabel(`2024-${String(i + 1).padStart(2, '0')}`)).toBe(`${n} 2024`))
  })
})

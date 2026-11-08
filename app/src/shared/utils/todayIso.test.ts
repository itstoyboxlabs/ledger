import { todayIso } from './todayIso'

describe('todayIso', () => {
  it('writes the local date with padded month and day', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
    expect(todayIso(new Date(2026, 10, 18, 0, 5))).toBe('2026-11-18')
  })
  it('defaults to now', () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

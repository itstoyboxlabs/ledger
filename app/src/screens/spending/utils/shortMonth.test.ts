import { shortMonth } from '@/screens/spending/utils/shortMonth'

describe('shortMonth', () => {
  it('returns the three-letter month', () => {
    expect(shortMonth('2026-05')).toBe('May')
    expect(shortMonth('2026-12')).toBe('Dec')
  })
  it('adds the two-digit year on January', () => {
    expect(shortMonth('2027-01')).toBe("Jan '27")
  })
})

import { ageOn } from './ageOn'

describe('ageOn', () => {
  it('counts full years', () => {
    expect(ageOn('1990-04-15', '2026-11-08')).toBe(36)
  })
  it('goes up on the birthday, not before', () => {
    expect(ageOn('1990-04-15', '2026-04-14')).toBe(35)
    expect(ageOn('1990-04-15', '2026-04-15')).toBe(36)
  })
  it('handles a February 29 birthday', () => {
    expect(ageOn('2000-02-29', '2025-02-28')).toBe(24)
    expect(ageOn('2000-02-29', '2025-03-01')).toBe(25)
    expect(ageOn('2000-02-29', '2028-02-29')).toBe(28)
  })
  it('is zero for a day before the birth date', () => {
    expect(ageOn('2020-06-01', '2019-01-01')).toBe(0)
  })
})

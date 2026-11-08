import { currentAge } from './currentAge'

describe('currentAge', () => {
  it('is null with no age saved', () => {
    expect(currentAge(null, 2026)).toBeNull()
    expect(currentAge(undefined, 2026)).toBeNull()
  })
  it('is the typed age in the year it was typed', () => {
    expect(currentAge({ age: 35, asOf: 2026 }, 2026)).toBe(35)
  })
  it('goes up by one each January', () => {
    expect(currentAge({ age: 35, asOf: 2026 }, 2027)).toBe(36)
    expect(currentAge({ age: 35, asOf: 2026 }, 2031)).toBe(40)
  })
  it('never goes below the typed age', () => {
    expect(currentAge({ age: 35, asOf: 2026 }, 2024)).toBe(35)
  })
  it('defaults to this year', () => {
    const y = new Date().getFullYear()
    expect(currentAge({ age: 30, asOf: y - 2 })).toBe(32)
  })
})

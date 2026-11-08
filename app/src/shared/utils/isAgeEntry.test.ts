import { isAgeEntry } from './isAgeEntry'

describe('isAgeEntry', () => {
  it('accepts an age and the year it was typed', () => {
    expect(isAgeEntry({ age: 35, asOf: 2026 })).toBe(true)
    expect(isAgeEntry({ age: 0, asOf: 2026 })).toBe(true)
  })
  it('rejects missing, broken or silly values', () => {
    for (const v of [null, undefined, 35, '35', {}, { age: 35 }, { asOf: 2026 }, { age: 35.5, asOf: 2026 }, { age: -1, asOf: 2026 }, { age: 200, asOf: 2026 }, { age: 35, asOf: '2026' }]) {
      expect(isAgeEntry(v)).toBe(false)
    }
  })
})

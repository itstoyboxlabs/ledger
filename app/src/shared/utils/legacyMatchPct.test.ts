import { legacyMatchPct } from './legacyMatchPct'

describe('legacyMatchPct', () => {
  it('uses the saved match401k number', () => {
    expect(legacyMatchPct({ match401k: 50 })).toBe(50)
    expect(legacyMatchPct({ match401k: 0, events: [] })).toBe(0)
  })
  it('assumes 100 for old saves that had no field', () => expect(legacyMatchPct({ age: 30 })).toBe(100))
  it('is 0 for newer saves with events', () => expect(legacyMatchPct({ events: [] })).toBe(0))
  it('is 0 for missing or invalid input', () => {
    expect(legacyMatchPct(null)).toBe(0)
    expect(legacyMatchPct([])).toBe(0)
    expect(legacyMatchPct('x')).toBe(0)
  })
})

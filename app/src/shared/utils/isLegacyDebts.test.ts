import { isLegacyDebts } from './isLegacyDebts'

describe('isLegacyDebts', () => {
  it('accepts the old three-field object', () => expect(isLegacyDebts({ loans: 1, card: 2, taxes: 0 })).toBe(true))
  it('rejects a missing or non-numeric field', () => {
    expect(isLegacyDebts({ loans: 1, card: 2 })).toBe(false)
    expect(isLegacyDebts({ loans: 1, card: '2', taxes: 3 })).toBe(false)
  })
  it('rejects arrays and non-objects', () => {
    expect(isLegacyDebts([])).toBe(false)
    expect(isLegacyDebts(null)).toBe(false)
    expect(isLegacyDebts('x')).toBe(false)
  })
})

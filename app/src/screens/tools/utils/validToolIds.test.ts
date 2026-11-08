import { validToolIds } from './validToolIds'

describe('validToolIds', () => {
  it('accepts arrays of strings', () => {
    expect(validToolIds([])).toBe(true)
    expect(validToolIds(['cash', 'debt'])).toBe(true)
  })
  it('rejects non-arrays and mixed arrays', () => {
    expect(validToolIds('cash')).toBe(false)
    expect(validToolIds(null)).toBe(false)
    expect(validToolIds(['a', 1])).toBe(false)
  })
})

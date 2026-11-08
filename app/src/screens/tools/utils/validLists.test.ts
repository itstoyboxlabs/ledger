import { validLists } from './validLists'

describe('validLists', () => {
  it('accepts well-formed lists and an empty array', () => {
    expect(validLists([])).toBe(true)
    expect(validLists([{ id: 'a', title: 'T', items: [] }])).toBe(true)
  })
  it('rejects non-arrays', () => {
    expect(validLists(null)).toBe(false)
    expect(validLists({})).toBe(false)
    expect(validLists('x')).toBe(false)
  })
  it('rejects lists missing id, title or items', () => {
    expect(validLists([{ title: 'T', items: [] }])).toBe(false)
    expect(validLists([{ id: 'a', items: [] }])).toBe(false)
    expect(validLists([{ id: 'a', title: 'T', items: 'no' }])).toBe(false)
    expect(validLists([null])).toBe(false)
  })
})

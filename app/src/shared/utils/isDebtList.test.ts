import { isDebtList } from './isDebtList'

describe('isDebtList', () => {
  it('accepts a list of debts', () => expect(isDebtList([{ id: 'a', balance: 10 }])).toBe(true))
  it('accepts an empty list', () => expect(isDebtList([])).toBe(true))
  it('rejects non-lists', () => {
    expect(isDebtList({ loans: 1 })).toBe(false)
    expect(isDebtList(null)).toBe(false)
  })
  it('rejects entries without a string id or numeric balance', () => {
    expect(isDebtList([{ id: 1, balance: 5 }])).toBe(false)
    expect(isDebtList([{ id: 'a', balance: '5' }])).toBe(false)
    expect(isDebtList([null])).toBe(false)
  })
})

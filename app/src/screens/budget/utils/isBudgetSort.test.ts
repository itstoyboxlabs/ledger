import { isBudgetSort } from './isBudgetSort'

describe('isBudgetSort', () => {
  it('accepts every column and file order', () => {
    for (const key of [null, 'name', 'amount', 'actual', 'diff']) expect(isBudgetSort({ key, dir: 'asc' })).toBe(true)
    expect(isBudgetSort({ key: 'amount', dir: 'desc' })).toBe(true)
  })
  it('rejects an unknown column or direction', () => {
    expect(isBudgetSort({ key: 'color', dir: 'asc' })).toBe(false)
    expect(isBudgetSort({ key: 'name', dir: 'up' })).toBe(false)
  })
  it('rejects nothing saved', () => {
    expect(isBudgetSort(null)).toBe(false)
    expect(isBudgetSort(undefined)).toBe(false)
  })
})

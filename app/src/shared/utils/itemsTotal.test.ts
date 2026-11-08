import { itemsTotal } from './itemsTotal'

describe('itemsTotal', () => {
  it('is 0 for no items', () => expect(itemsTotal([])).toBe(0))
  it('sums month and week items', () =>
    expect(itemsTotal([{ mode: 'month', amount: 30 }, { mode: 'week', amount: 10, perWeek: 3 }])).toBe(150))
})

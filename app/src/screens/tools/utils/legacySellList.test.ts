import { legacySellList } from './legacySellList'

beforeEach(() => localStorage.clear())

describe('legacySellList', () => {
  it('is empty with nothing saved', () => {
    expect(legacySellList()).toEqual([])
  })
  it('migrates old sellItems into a list with id sell', () => {
    const items = [{ id: 'a', name: 'Bike', amount: 120 }]
    localStorage.setItem('ledger:sellItems', JSON.stringify(items))
    expect(legacySellList()).toEqual([
      { id: 'sell', title: 'Selling stuff', description: 'List what you plan to sell and what you expect to get for each.', items },
    ])
    expect(localStorage.getItem('ledger:sellItems')).toBe(JSON.stringify(items))
  })
  it('accepts an empty array', () => {
    localStorage.setItem('ledger:sellItems', '[]')
    expect(legacySellList()[0].items).toEqual([])
  })
  it('ignores malformed items', () => {
    localStorage.setItem('ledger:sellItems', JSON.stringify([{ id: 'a', amount: '5' }]))
    expect(legacySellList()).toEqual([])
    localStorage.setItem('ledger:sellItems', JSON.stringify([null]))
    expect(legacySellList()).toEqual([])
  })
  it('ignores unparseable JSON and non-arrays', () => {
    localStorage.setItem('ledger:sellItems', '{oops')
    expect(legacySellList()).toEqual([])
    localStorage.setItem('ledger:sellItems', '{"a":1}')
    expect(legacySellList()).toEqual([])
  })
})

import { nextLogSort } from './nextLogSort'

describe('nextLogSort', () => {
  it('flips the direction of the current column', () => {
    expect(nextLogSort({ key: 'date', dir: -1 }, 'date')).toEqual({ key: 'date', dir: 1 })
    expect(nextLogSort({ key: 'note', dir: 1 }, 'note')).toEqual({ key: 'note', dir: -1 })
  })
  it('starts date and amount descending', () => {
    expect(nextLogSort({ key: 'note', dir: 1 }, 'amount')).toEqual({ key: 'amount', dir: -1 })
    expect(nextLogSort({ key: 'note', dir: 1 }, 'date')).toEqual({ key: 'date', dir: -1 })
  })
  it('starts text columns ascending', () => {
    expect(nextLogSort({ key: 'date', dir: -1 }, 'note')).toEqual({ key: 'note', dir: 1 })
    expect(nextLogSort({ key: 'date', dir: -1 }, 'row')).toEqual({ key: 'row', dir: 1 })
  })
})

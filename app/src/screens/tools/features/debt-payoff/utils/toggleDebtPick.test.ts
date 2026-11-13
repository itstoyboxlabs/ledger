import { toggleDebtPick } from './toggleDebtPick'

const ids = ['a', 'b', 'c']

describe('toggleDebtPick', () => {
  it('unticking one from all keeps the others', () => {
    expect(toggleDebtPick([], ids, 'a')).toEqual(['b', 'c'])
  })
  it('ticking the missing one goes back to all', () => {
    expect(toggleDebtPick(['b', 'c'], ids, 'a')).toEqual([])
  })
  it('ticking another adds it', () => {
    expect(toggleDebtPick(['a'], ids, 'c')).toEqual(['a', 'c'])
  })
  it('keeps the last ticked debt', () => {
    expect(toggleDebtPick(['a'], ids, 'a')).toEqual(['a'])
  })
  it('ignores ids of debts that no longer exist', () => {
    expect(toggleDebtPick(['gone', 'a'], ids, 'b')).toEqual(['a', 'b'])
  })
})

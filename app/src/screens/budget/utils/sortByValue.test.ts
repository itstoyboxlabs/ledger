import { sortByValue } from './sortByValue'

const rows = [{ n: 'b', v: 2 }, { n: 'x', v: null }, { n: 'a', v: 3 }, { n: 'c', v: 1 }]
const names = (list: { n: string }[]) => list.map((r) => r.n).join('')

describe('sortByValue', () => {
  it('sorts ascending and descending', () => {
    expect(names(sortByValue(rows, (r) => r.v, 'asc'))).toBe('cbax')
    expect(names(sortByValue(rows, (r) => r.v, 'desc'))).toBe('abcx')
  })
  it('keeps rows with no value last both ways', () => {
    expect(sortByValue(rows, (r) => r.v, 'asc').at(-1)?.n).toBe('x')
    expect(sortByValue(rows, (r) => r.v, 'desc').at(-1)?.n).toBe('x')
  })
  it('sorts strings', () => {
    expect(names(sortByValue(rows, (r) => r.n, 'asc'))).toBe('abcx')
  })
  it('leaves the original list alone', () => {
    sortByValue(rows, (r) => r.v, 'asc')
    expect(names(rows)).toBe('bxac')
  })
})

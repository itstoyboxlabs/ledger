import { sameData } from './sameData'

describe('sameData', () => {
  it('is true for equal structures', () => expect(sameData({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true))
  it('is false for different values', () => expect(sameData({ a: 1 }, { a: 2 })).toBe(false))
  it('is order sensitive for keys', () => expect(sameData({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(false))
  it('compares primitives', () => {
    expect(sameData(null, null)).toBe(true)
    expect(sameData([], {})).toBe(false)
  })
})

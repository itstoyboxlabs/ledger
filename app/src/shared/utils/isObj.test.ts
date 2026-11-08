import { isObj } from './isObj'

describe('isObj', () => {
  it('is true for plain objects', () => {
    expect(isObj({})).toBe(true)
    expect(isObj({ a: 1 })).toBe(true)
  })
  it('is false for arrays', () => {
    expect(isObj([])).toBe(false)
  })
  it('is falsy for null, undefined and primitives', () => {
    for (const v of [null, undefined, 0, 1, '', 'a', true, false]) expect(isObj(v)).toBeFalsy()
  })
})

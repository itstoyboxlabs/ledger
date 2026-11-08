import { typedMerge } from './typedMerge'

describe('typedMerge', () => {
  const defaults = { a: 1, b: 'x', c: true }
  it('keeps defaults when raw is missing', () => {
    expect(typedMerge(defaults, null)).toEqual(defaults)
    expect(typedMerge(defaults, undefined)).toEqual(defaults)
  })
  it('takes values of the same type', () => {
    expect(typedMerge(defaults, { a: 5, b: 'y', c: false })).toEqual({ a: 5, b: 'y', c: false })
  })
  it('ignores wrong types and unknown keys', () => {
    expect(typedMerge(defaults, { a: '5', b: 2, z: 1 })).toEqual(defaults)
  })
  it('does not mutate the defaults', () => {
    typedMerge(defaults, { a: 9 })
    expect(defaults.a).toBe(1)
  })
})

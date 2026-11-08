import { validEvent } from './validEvent'

describe('validEvent', () => {
  it('accepts an object with a string id', () => {
    expect(validEvent({ id: 'e1' })).toBe(true)
  })
  it('rejects missing or non-string ids', () => {
    expect(validEvent({})).toBe(false)
    expect(validEvent({ id: 5 })).toBe(false)
  })
  it('rejects null and primitives', () => {
    expect(validEvent(null)).toBeFalsy()
    expect(validEvent(undefined)).toBeFalsy()
    expect(validEvent('e1')).toBeFalsy()
  })
})

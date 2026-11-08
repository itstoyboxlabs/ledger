import { roundCents } from './roundCents'

describe('roundCents', () => {
  it('rounds to two decimals', () => {
    expect(roundCents(2.345)).toBe(2.35)
    expect(roundCents(-12.344)).toBe(-12.34)
  })
  it('turns float noise into a plain zero', () => {
    expect(Object.is(roundCents(0.1 + 0.2 - 0.3), 0)).toBe(true)
    expect(Object.is(roundCents(-0.0000001), 0)).toBe(true)
    expect(Object.is(roundCents(-0.004), 0)).toBe(true)
  })
})

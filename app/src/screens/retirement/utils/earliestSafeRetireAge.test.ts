import { earliestSafeRetireAge } from './earliestSafeRetireAge'

describe('earliestSafeRetireAge', () => {
  it('returns the first age the money lasts from', () => {
    const simulate = (r: number) => ({ runOutAge: r < 55 ? 80 : null })
    expect(earliestSafeRetireAge(30, 95, simulate)).toBe(55)
  })
  it('starts the year after the current age', () => {
    const tried: number[] = []
    earliestSafeRetireAge(40, 43, (r) => (tried.push(r), { runOutAge: 70 }))
    expect(tried).toEqual([41, 42])
  })
  it('returns null when no age before the plan end works', () => {
    expect(earliestSafeRetireAge(30, 95, () => ({ runOutAge: 70 }))).toBeNull()
  })
})

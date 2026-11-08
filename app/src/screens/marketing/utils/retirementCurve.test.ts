import { retirementCurve } from '@/screens/marketing/utils/retirementCurve'

const points = [{ age: 34, value: 0 }, { age: 47, value: 1700000 }, { age: 60, value: 3400000 }]

describe('retirementCurve', () => {
  it('puts the first age on the left edge and the last at the right', () => {
    const c = retirementCurve(points, 47, 1700000)
    expect(c.line.startsWith('M14,185 ')).toBe(true)
    expect(c.line.endsWith(' 500,60')).toBe(true)
  })

  it('closes the area down to the baseline', () => {
    const c = retirementCurve(points, 47, 1700000)
    expect(c.area.endsWith('L500,185 L14,185Z')).toBe(true)
  })

  it('places the marker and the age ticks', () => {
    const c = retirementCurve(points, 47, 1700000)
    expect(c.mark).toEqual({ x: 257, y: 122.5 })
    expect(c.ticks.map((t) => t.age)).toEqual([35, 40, 45, 50, 55, 60])
    expect(c.ticks[5].x).toBe(500)
  })
})

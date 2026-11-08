import { patchAllocation } from './patchAllocation'

const alloc = [
  { id: 'a', target: 'savings', pct: 60 },
  { id: 'b', target: 'r1', pct: 30 },
]

describe('patchAllocation', () => {
  it('changes only the share with that id', () => {
    expect(patchAllocation(alloc, 'b', { target: 'r2' })).toEqual([alloc[0], { id: 'b', target: 'r2', pct: 30 }])
  })
  it('caps the percent at what the other shares leave', () => {
    expect(patchAllocation(alloc, 'b', { pct: 70 })[1].pct).toBe(40)
  })
  it('never goes below zero or keeps a non-number', () => {
    expect(patchAllocation(alloc, 'b', { pct: -5 })[1].pct).toBe(0)
    expect(patchAllocation(alloc, 'b', { pct: Number.NaN })[1].pct).toBe(0)
  })
  it('allows 0 when the others are already over 100', () => {
    const over = [{ id: 'a', target: 'savings', pct: 120 }, { id: 'b', target: 'r1', pct: 10 }]
    expect(patchAllocation(over, 'b', { pct: 10 })[1].pct).toBe(0)
  })
})

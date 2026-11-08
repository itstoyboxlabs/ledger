import { weightedReturn } from './weightedReturn'

describe('weightedReturn', () => {
  it('weights each fund by its allocation', () => {
    expect(weightedReturn([{ name: 'A', alloc: 75, perf: 8 }, { name: 'B', alloc: 25, perf: 4 }])).toEqual({ total: 100, avg: 7 })
  })
  it('works when the allocations do not add up to 100', () => {
    expect(weightedReturn([{ name: 'A', alloc: 10, perf: 6 }, { name: 'B', alloc: 10, perf: 2 }])).toEqual({ total: 20, avg: 4 })
  })
  it('returns 0 with nothing allocated', () => {
    expect(weightedReturn([])).toEqual({ total: 0, avg: 0 })
    expect(weightedReturn([{ name: 'A', alloc: 0, perf: 9 }])).toEqual({ total: 0, avg: 0 })
  })
})

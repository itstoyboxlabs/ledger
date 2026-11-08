import { milestoneBalances } from './milestoneBalances'

const rows = Array.from({ length: 70 }, (_, i) => ({ age: 30 + i, total: (30 + i) * 1000 }))

describe('milestoneBalances', () => {
  it('lists the milestone ages inside the plan plus the end age, in order', () => {
    expect(milestoneBalances(rows, 30, 95).map((m) => m.age)).toEqual([60, 70, 80, 90, 95])
  })
  it('does not repeat an end age that is already a milestone', () => {
    expect(milestoneBalances(rows, 30, 90).map((m) => m.age)).toEqual([60, 70, 80, 90])
  })
  it('skips milestones at or before the current age', () => {
    expect(milestoneBalances(rows, 70, 85).map((m) => m.age)).toEqual([80, 85])
  })
  it('reads each total from the projection, 0 when the row is missing', () => {
    expect(milestoneBalances(rows, 30, 95)[0]).toEqual({ age: 60, total: 60000 })
    expect(milestoneBalances([], 30, 65)).toEqual([{ age: 60, total: 0 }, { age: 65, total: 0 }])
  })
})

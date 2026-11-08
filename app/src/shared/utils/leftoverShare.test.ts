import { leftoverShare } from './leftoverShare'
import type { LeftoverAllocation } from '@/shared/types/LeftoverAllocation'

describe('leftoverShare', () => {
  const list: LeftoverAllocation[] = [
    { id: 'a', target: 'savings', pct: 50 },
    { id: 'b', target: 'savings', pct: 10 },
    { id: 'c', target: 'r1', pct: 25 },
  ]
  it('adds the percents aimed at one target', () => expect(leftoverShare(list, 'savings', 1000)).toBe(600))
  it('returns only the matching target', () => expect(leftoverShare(list, 'r1', 400)).toBe(100))
  it('is 0 for no match or no leftover', () => {
    expect(leftoverShare(list, 'zzz', 1000)).toBe(0)
    expect(leftoverShare(list, 'savings', 0)).toBe(0)
    expect(leftoverShare([], 'savings', 1000)).toBe(0)
  })
})

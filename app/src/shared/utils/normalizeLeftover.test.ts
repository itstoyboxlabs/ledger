import { normalizeLeftover } from './normalizeLeftover'

describe('normalizeLeftover', () => {
  it('returns [] for non-lists', () => {
    expect(normalizeLeftover(undefined)).toEqual([])
    expect(normalizeLeftover({})).toEqual([])
  })
  it('drops entries without a string id', () =>
    expect(normalizeLeftover([null, 5, { id: 3 }, { id: 'a', target: 'r1', pct: 20 }])).toEqual([{ id: 'a', target: 'r1', pct: 20 }]))
  it('defaults target to savings and bad pct to 0', () =>
    expect(normalizeLeftover([{ id: 'a', pct: 'x' }])).toEqual([{ id: 'a', target: 'savings', pct: 0 }]))
  it('clamps pct to 0..100', () => {
    const out = normalizeLeftover([{ id: 'a', pct: 150 }, { id: 'b', pct: -5 }])
    expect(out.map((o) => o.pct)).toEqual([100, 0])
  })
})

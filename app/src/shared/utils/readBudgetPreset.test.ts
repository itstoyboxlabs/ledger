import { readBudgetPreset } from './readBudgetPreset'

const row = { id: 'r1', name: 'Rent', amount: 2000 }

describe('readBudgetPreset', () => {
  it('reads the first shape, a list of rows', () => {
    expect(readBudgetPreset([row])).toEqual({ rows: [row] })
  })
  it('reads rows, removed subscriptions and the leftover split', () => {
    const d = { rows: [row], dismissedSubs: { Canva: '2026-10-01' }, leftover: [{ id: 'a', target: 'savings', pct: 50 }] }
    expect(readBudgetPreset(d)).toEqual(d)
  })
  it('leaves out what the preset does not hold', () => {
    expect(readBudgetPreset({ rows: [row] })).toEqual({ rows: [row] })
  })
  it('is null for anything else', () => {
    expect(readBudgetPreset(null)).toBeNull()
    expect(readBudgetPreset({ rows: 'x' })).toBeNull()
    expect(readBudgetPreset('x')).toBeNull()
  })
})

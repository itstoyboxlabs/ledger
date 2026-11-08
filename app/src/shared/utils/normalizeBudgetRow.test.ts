import { normalizeBudgetRow } from './normalizeBudgetRow'
import type { RawBudgetRow } from '@/shared/types/RawBudgetRow'

describe('normalizeBudgetRow', () => {
  it('passes through non-objects', () => {
    expect(normalizeBudgetRow(null as unknown as RawBudgetRow)).toBe(null)
    expect(normalizeBudgetRow('x' as unknown as RawBudgetRow)).toBe('x')
  })
  it('gives a plain row type simple', () =>
    expect(normalizeBudgetRow({ id: 'a', name: 'Rent', amount: 1800 })).toEqual({ id: 'a', name: 'Rent', amount: 1800, type: 'simple' }))
  it('makes a row with items a breakdown and cleans items', () => {
    // loose item fields on purpose: text amounts and an unknown mode
    const r = normalizeBudgetRow({ id: 'a', items: [{ id: 'x', name: 'Gym', amount: '30', mode: 'bogus' }, { mode: 'week', amount: 5, perWeek: 2 }] } as unknown as RawBudgetRow)
    const items = r.items ?? []
    expect(r.type).toBe('breakdown')
    expect(items[0]).toEqual({ id: 'x', name: 'Gym', mode: 'month', amount: 30, perWeek: 0 })
    expect(items[1]?.mode).toBe('week')
    expect(items[1]?.id).toMatch(/^i/)
    expect(items[1]?.name).toBe('')
  })
  it('converts a dining plan to two week items and sums the amount', () => {
    const r = normalizeBudgetRow({ id: 'd', dining: { uberAvg: 20, uberPerWeek: 2, restAvg: 50, restPerWeek: 1 } } as RawBudgetRow)
    expect('dining' in r).toBe(false)
    expect(r.type).toBe('breakdown')
    expect((r.items ?? []).map((i) => i.name)).toEqual(['Uber Eats', 'Restaurants'])
    expect(r.amount).toBe(20 * 2 * 4 + 50 * 1 * 4)
  })
  it('drops items from a simple row', () => {
    const r = normalizeBudgetRow({ id: 'a', type: 'simple', items: [{ amount: 1 }], amount: 5 } as RawBudgetRow)
    expect(r).toEqual({ id: 'a', type: 'simple', amount: 5 })
  })
  it('gives an empty breakdown an empty list', () => expect(normalizeBudgetRow({ type: 'breakdown' } as RawBudgetRow).items).toEqual([]))
})

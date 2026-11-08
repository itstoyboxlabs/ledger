import { budgetPresetOptions } from './budgetPresetOptions'
import { applyData } from '@/shared/utils/applyData'
import type { Preset } from '@/shared/types/Preset'

const SUBS = [
  { name: 'Netflix', account: 'cc', cadence: 'monthly' as const, amount: 15.49, lastSeen: '2026-10-12' },
]
const load = () => applyData({ accounts: {}, periods: {}, subscriptions: SUBS, transactions: [] })

describe('budgetPresetOptions', () => {
  beforeEach(load)

  it('adds a preset the way Budget does: rows, live subscriptions, no hidden rows', () => {
    const presets: Preset[] = [{
      name: 'Retirement',
      data: [
        { id: 'r', name: 'Rent', amount: 1200 },
        { id: 'h', name: 'Gym', amount: 40, hidden: true },
        { id: 'f', name: 'Food', type: 'breakdown', amount: 260, items: [{ id: 'a', name: 'Out', mode: 'week', amount: 35, perWeek: 1 }, { id: 'b', name: 'Take', mode: 'week', amount: 15, perWeek: 2 }] },
      ],
    }]
    // 1200 + 260 + Netflix live (rounds to 15, like on Budget)
    const [o] = budgetPresetOptions(presets, undefined)
    expect(o.name).toBe('Retirement')
    expect(o.monthly).toBe(1200 + 260 + 15)
  })

  it('leaves out subscriptions dismissed today', () => {
    const presets: Preset[] = [{ name: 'A', data: [{ id: 'r', name: 'Rent', amount: 1000 }] }]
    expect(budgetPresetOptions(presets, { Netflix: '2026-10-12' })[0].monthly).toBe(1000)
  })

  it('counts debt payment rows like any row', () => {
    const presets: Preset[] = [{ name: 'A', data: [{ id: 'c', name: 'Car loan', amount: 300 }] }]
    expect(budgetPresetOptions(presets, { Netflix: '2026-10-12' })[0].monthly).toBe(300)
  })

  it('skips presets that are not a row list', () => {
    const presets = [{ name: 'Bad', data: { rows: [] } }, { name: 'Ok', data: [] }] as Preset[]
    expect(budgetPresetOptions(presets, { Netflix: '2026-10-12' })).toEqual([{ name: 'Ok', monthly: 0 }])
  })
})

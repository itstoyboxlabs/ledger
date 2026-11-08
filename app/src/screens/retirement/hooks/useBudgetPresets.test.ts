import { renderHook, waitFor } from '@testing-library/react'
import { useBudgetPresets } from './useBudgetPresets'
import { seedStorage } from '@/test-utils/seedStorage'
import { applyData } from '@/shared/utils/applyData'

beforeEach(() => applyData({ accounts: {}, periods: {}, subscriptions: [], transactions: [] }))

describe('useBudgetPresets', () => {
  it('is empty first, then lists Budget presets and today\'s expenses', async () => {
    await seedStorage({
      budget: { rows: [{ id: 'r', name: 'Rent', amount: 2000 }, { id: 'f', name: 'Food', amount: 500 }] },
      presets: { expenses: [{ name: 'Retirement', data: [{ id: 'r', name: 'Rent', amount: 1500 }] }], retirement: [{ name: 'Plan', data: {} }] },
    })
    const { result } = renderHook(() => useBudgetPresets())
    expect(result.current).toEqual({ options: null, today: null })
    await waitFor(() => expect(result.current.options).toEqual([{ name: 'Retirement', monthly: 1500 }]))
    expect(result.current.today).toBe(2500)
  })
  it('has no presets and no today line for an empty Budget', async () => {
    await seedStorage()
    const { result } = renderHook(() => useBudgetPresets())
    await waitFor(() => expect(result.current.options).toEqual([]))
    expect(result.current.today).toBeNull()
  })
})

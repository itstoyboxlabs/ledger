import { renderHook, waitFor } from '@testing-library/react'
import { useBudgetRows } from './useBudgetRows'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage({ budget: { rows: [{ id: 'r1', name: 'Rent' }] } }))

describe('useBudgetRows', () => {
  it('is null first, then the stored rows', async () => {
    const { result } = renderHook(() => useBudgetRows())
    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toEqual([{ id: 'r1', name: 'Rent' }]))
  })
})

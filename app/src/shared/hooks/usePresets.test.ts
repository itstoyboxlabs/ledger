import { renderHook, act, waitFor } from '@testing-library/react'
import { usePresets } from './usePresets'
import { seedStorage } from '@/test-utils/seedStorage'
import { getPresets } from '@/shared/utils/getPresets'

const saved = async (key: string) => (await getPresets())[key]

beforeEach(async () => {
  localStorage.clear()
  await seedStorage({ presets: { tool: [{ name: 'A', data: { x: 1 } }, { name: 'B', data: { x: 2 } }] } })
})

describe('usePresets', () => {
  it('loads presets for its key', async () => {
    const { result } = renderHook(() => usePresets('tool'))
    await waitFor(() => expect(result.current.presets).toHaveLength(2))
  })

  it('returns an empty list for an unknown key', async () => {
    const { result } = renderHook(() => usePresets('other'))
    await act(async () => {})
    expect(result.current.presets).toEqual([])
  })

  it('save appends a new name and replaces an existing one in place', async () => {
    const { result } = renderHook(() => usePresets('tool'))
    await waitFor(() => expect(result.current.presets).toHaveLength(2))
    act(() => result.current.save('C', { x: 3 }))
    expect(result.current.presets.map((p) => p.name)).toEqual(['A', 'B', 'C'])
    act(() => result.current.save('A', { x: 10 }))
    expect(result.current.presets[0]).toEqual({ name: 'A', data: { x: 10 } })
    expect(result.current.presets).toHaveLength(3)
    await waitFor(async () => expect(await saved('tool')).toEqual(result.current.presets))
  })

  it('remove drops a preset and saves', async () => {
    const { result } = renderHook(() => usePresets('tool'))
    await waitFor(() => expect(result.current.presets).toHaveLength(2))
    act(() => result.current.remove('A'))
    expect(result.current.presets.map((p) => p.name)).toEqual(['B'])
    await waitFor(async () => expect(await saved('tool')).toEqual([{ name: 'B', data: { x: 2 } }]))
  })

  it('migrates legacy rent presets from localStorage once', async () => {
    localStorage.setItem('ledger:rentScenarioPresets', JSON.stringify([{ name: 'Old', overrides: { rent: 1 } }]))
    const { result } = renderHook(() => usePresets('rentScenario'))
    await waitFor(() => expect(result.current.presets).toEqual([{ name: 'Old', data: { rent: 1 } }]))
    expect(localStorage.getItem('ledger:rentScenarioPresets')).toBeNull()
    await waitFor(async () => expect(await saved('rentScenario')).toEqual([{ name: 'Old', data: { rent: 1 } }]))
  })
})

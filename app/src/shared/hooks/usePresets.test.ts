import { renderHook, act, waitFor } from '@testing-library/react'
import { usePresets } from './usePresets'
import { seedStorage } from '@/test-utils/seedStorage'
import { getPresets } from '@/shared/utils/getPresets'
import { presetIdFor } from '@/shared/utils/presetIdFor'

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

  it('a save made before the stored list loads adds to it instead of replacing it', async () => {
    const { result } = renderHook(() => usePresets('tool'))
    act(() => result.current.save('C', { x: 3 }))
    await waitFor(() => expect(result.current.presets.map((p) => p.name)).toEqual(['A', 'B', 'C']))
    await waitFor(async () => expect((await saved('tool'))?.map((p) => p.name)).toEqual(['A', 'B', 'C']))
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

  it('without ids, presets stay as they are', async () => {
    const { result } = renderHook(() => usePresets('tool'))
    await waitFor(() => expect(result.current.presets).toHaveLength(2))
    expect(result.current.presets[0]).toEqual({ name: 'A', data: { x: 1 } })
  })

  it('with ids, old presets get a stable id from their name on first load, saved back', async () => {
    const { result } = renderHook(() => usePresets('tool', { ids: true }))
    await waitFor(() => expect(result.current.presets[0]).toEqual({ id: presetIdFor('A'), name: 'A', data: { x: 1 } }))
    await waitFor(async () => expect((await saved('tool'))?.map((p) => p.id)).toEqual([presetIdFor('A'), presetIdFor('B')]))
  })

  it('with ids, a new preset gets an id and overwriting keeps it', async () => {
    const { result } = renderHook(() => usePresets('tool', { ids: true }))
    await waitFor(() => expect(result.current.presets).toHaveLength(2))
    act(() => result.current.save('C', { x: 3 }))
    const id = result.current.presets[2].id
    expect(id).toMatch(/^pr/)
    act(() => result.current.save('C', { x: 4 }))
    expect(result.current.presets[2]).toEqual({ id, name: 'C', data: { x: 4 } })
  })

  it('rename keeps the id and data and refuses a name in use', async () => {
    const { result } = renderHook(() => usePresets('tool', { ids: true }))
    await waitFor(() => expect(result.current.presets[0].id).toBeTruthy())
    const id = result.current.presets[0].id
    act(() => result.current.rename('A', 'B'))
    expect(result.current.presets[0].name).toBe('A')
    act(() => result.current.rename('A', '  Lean  '))
    expect(result.current.presets[0]).toEqual({ id, name: 'Lean', data: { x: 1 } })
    await waitFor(async () => expect((await saved('tool'))?.[0]).toEqual({ id, name: 'Lean', data: { x: 1 } }))
  })
})

import { act, renderHook } from '@testing-library/react'
import { useIconCatalog } from './useIconCatalog'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { storageModeStore } from '@/shared/state/storageModeStore'

beforeEach(() => {
  iconCatalogStore.setState({ status: 'idle', domains: new Set(), names: {} })
  sessionStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  storageModeStore.setState({ mode: 'browser' })
})

describe('useIconCatalog', () => {
  it('loads the catalog after the first render in browser mode and re-renders when it arrives', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ domains: ['uber.com'], names: {} }) })))
    const { result } = renderHook(() => useIconCatalog())
    expect(result.current).toBe('queued')
    await act(() => vi.runAllTimersAsync())
    expect(result.current).toBe('ready')
  })
  it('never loads it in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useIconCatalog())
    await act(() => vi.runAllTimersAsync())
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current).toBe('idle')
  })
  it('stays quiet when the download fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    const { result } = renderHook(() => useIconCatalog())
    await act(() => vi.runAllTimersAsync())
    expect(result.current).toBe('failed')
  })
})

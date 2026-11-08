import { requestIconCatalog } from './requestIconCatalog'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'

beforeEach(() => {
  iconCatalogStore.setState({ status: 'idle', domains: new Set(), names: {} })
  sessionStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('requestIconCatalog', () => {
  it('waits before loading, so the first paint is not held up', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ domains: ['uber.com'], names: {} }) }))
    vi.stubGlobal('fetch', fetchMock)
    requestIconCatalog()
    expect(fetchMock).not.toHaveBeenCalled()
    await vi.runAllTimersAsync()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(iconCatalogStore.getState().status).toBe('ready')
  })
  it('uses requestIdleCallback when the browser has it', () => {
    const idle = vi.fn()
    vi.stubGlobal('requestIdleCallback', idle)
    requestIconCatalog()
    requestIconCatalog()
    expect(idle).toHaveBeenCalledTimes(1)
    expect(iconCatalogStore.getState().status).toBe('queued')
  })
  it('does nothing once the catalog has been asked for', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    iconCatalogStore.setState({ status: 'failed' })
    requestIconCatalog()
    await vi.runAllTimersAsync()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

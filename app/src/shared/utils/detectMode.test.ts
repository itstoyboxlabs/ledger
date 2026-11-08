import { detectMode } from './detectMode'
import { storageModeStore } from '@/shared/state/storageModeStore'

afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  vi.unstubAllGlobals()
})

describe('detectMode', () => {
  it('is local when the server answers with JSON', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, json: async () => ({ rows: [] }) }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await detectMode()).toBe('local')
    expect(storageModeStore.getState().mode).toBe('local')
    expect(fetchMock).toHaveBeenCalledWith('/api/budget', { headers: { accept: 'application/json' } })
  })
  it('stays browser on a 404', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })))
    expect(await detectMode()).toBe('browser')
  })
  it('is browser when the response is not JSON (SPA fallback page)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => { throw new SyntaxError('html') } })))
    expect(await detectMode()).toBe('browser')
  })
  it('is browser when the request fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('offline') }))
    expect(await detectMode()).toBe('browser')
  })
  it('asks for persistent storage in browser mode', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    const persist = vi.fn(async () => true)
    vi.stubGlobal('navigator', { ...navigator, storage: { persist } })
    await detectMode()
    expect(persist).toHaveBeenCalled()
  })
  it('does not ask for persistent storage in local mode', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({}) })))
    const persist = vi.fn(async () => true)
    vi.stubGlobal('navigator', { ...navigator, storage: { persist } })
    await detectMode()
    expect(persist).not.toHaveBeenCalled()
  })
})

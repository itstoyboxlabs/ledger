import { saveLog } from './saveLog'
import { idbGet } from './idbGet'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'
import type { LogEntry } from '@/shared/types/LogEntry'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const okJson = (body: unknown) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => body }))
const failing = (status: number) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: false, status, json: async () => ({}) }))

describe('saveLog', () => {
  it('writes to IndexedDB in browser mode', async () => {
    await saveLog([{ id: 'l1', amount: 5 } as LogEntry])
    expect(await idbGet('log')).toEqual({ entries: [{ id: 'l1', amount: 5 } as LogEntry] })
  })
  it('overwrites the previous value', async () => {
    await saveLog([{ id: 'l1', amount: 5 } as LogEntry])
    await saveLog([])
    expect(await idbGet('log')).toEqual({ entries: [] })
  })
  it('posts to the server in local mode and leaves IndexedDB alone', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    await saveLog([{ id: 'l1', amount: 5 } as LogEntry])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/log')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ entries: [{ id: 'l1', amount: 5 } as LogEntry] })
    expect(await idbGet('log')).toEqual({ entries: [] })
  })
  it('throws in local mode when the server rejects', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(saveLog([{ id: 'l1', amount: 5 } as LogEntry])).rejects.toThrow('/api/log 500')
  })
})

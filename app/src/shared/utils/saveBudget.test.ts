import { saveBudget } from './saveBudget'
import { idbGet } from './idbGet'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const okJson = (body: unknown) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => body }))
const failing = (status: number) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: false, status, json: async () => ({}) }))

describe('saveBudget', () => {
  it('writes to IndexedDB in browser mode', async () => {
    await saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    expect(await idbGet('budget')).toEqual({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
  })
  it('overwrites the previous value', async () => {
    await saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    await saveBudget({ rows: [] })
    expect(await idbGet('budget')).toEqual({ rows: [] })
  })
  it('posts to the server in local mode and leaves IndexedDB alone', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    await saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/budget')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    expect(await idbGet('budget')).toEqual({ rows: [] })
  })
  it('throws in local mode when the server rejects', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })).rejects.toThrow('/api/budget 500')
  })
})

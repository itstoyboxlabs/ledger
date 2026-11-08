import { getLog } from './getLog'
import { idbSet } from './idbSet'
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

describe('getLog', () => {
  it('returns the empty default in browser mode when nothing is saved', async () => {
    await idbSet('log', undefined)
    expect(await getLog()).toEqual({ entries: [] })
  })
  it('reads what is stored in IndexedDB', async () => {
    await idbSet('log', { entries: [{ id: 'l1', amount: 5 }] })
    expect(await getLog()).toEqual({ entries: [{ id: 'l1', amount: 5 }] })
  })
  it('reads from the server in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = okJson({ entries: [{ id: 'l1', amount: 5 }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getLog()).toEqual({ entries: [{ id: 'l1', amount: 5 }] })
    expect(fetchMock).toHaveBeenCalledWith('/api/log')
  })
  it('throws in local mode when the server fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(getLog()).rejects.toThrow('/api/log 500')
  })
})

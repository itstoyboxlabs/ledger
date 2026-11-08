import { getData } from './getData'
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

describe('getData', () => {
  it('returns the empty default in browser mode when nothing is saved', async () => {
    await idbSet('data', undefined)
    expect(await getData()).toEqual(null)
  })
  it('reads what is stored in IndexedDB', async () => {
    await idbSet('data', { accounts: {}, transactions: [{ id: 't1', date: '2026-01-01', amount: 1, kind: 'spend' }] })
    expect(await getData()).toEqual({ accounts: {}, transactions: [{ id: 't1', date: '2026-01-01', amount: 1, kind: 'spend' }] })
  })
  it('reads from the server in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = okJson({ accounts: {}, transactions: [{ id: 't1', date: '2026-01-01', amount: 1, kind: 'spend' }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getData()).toEqual({ accounts: {}, transactions: [{ id: 't1', date: '2026-01-01', amount: 1, kind: 'spend' }] })
    expect(fetchMock).toHaveBeenCalledWith('/api/transactions')
  })
  it('throws in local mode when the server fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(getData()).rejects.toThrow('/api/transactions 500')
  })
})

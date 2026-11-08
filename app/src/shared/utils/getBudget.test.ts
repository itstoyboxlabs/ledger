import { getBudget } from './getBudget'
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

describe('getBudget', () => {
  it('returns the empty default in browser mode when nothing is saved', async () => {
    await idbSet('budget', undefined)
    expect(await getBudget()).toEqual({ rows: [], dismissedSubs: {} })
  })
  it('reads what is stored in IndexedDB', async () => {
    await idbSet('budget', { rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    expect(await getBudget()).toEqual({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
  })
  it('reads from the server in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = okJson({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getBudget()).toEqual({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    expect(fetchMock).toHaveBeenCalledWith('/api/budget')
  })
  it('throws in local mode when the server fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(getBudget()).rejects.toThrow('/api/budget 500')
  })
})

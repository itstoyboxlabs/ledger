import { getNotes } from './getNotes'
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

describe('getNotes', () => {
  it('returns the empty default in browser mode when nothing is saved', async () => {
    await idbSet('notes', undefined)
    expect(await getNotes()).toEqual({ notes: [] })
  })
  it('reads what is stored in IndexedDB', async () => {
    await idbSet('notes', { notes: [{ id: 'n1', text: 'hi' }] })
    expect(await getNotes()).toEqual({ notes: [{ id: 'n1', text: 'hi' }] })
  })
  it('reads from the server in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = okJson({ notes: [{ id: 'n1', text: 'hi' }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getNotes()).toEqual({ notes: [{ id: 'n1', text: 'hi' }] })
    expect(fetchMock).toHaveBeenCalledWith('/api/notes')
  })
  it('throws in local mode when the server fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(getNotes()).rejects.toThrow('/api/notes 500')
  })
})

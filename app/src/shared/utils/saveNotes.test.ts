import { saveNotes } from './saveNotes'
import { idbGet } from './idbGet'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'
import type { Note } from '@/shared/types/Note'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const failing = (status: number) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: false, status, json: async () => ({}) }))

describe('saveNotes', () => {
  it('writes to IndexedDB in browser mode', async () => {
    await saveNotes([{ id: 'n1', text: 'hi' } as Note])
    expect(await idbGet('notes')).toEqual({ notes: [{ id: 'n1', text: 'hi' } as Note] })
  })
  it('overwrites the previous value', async () => {
    await saveNotes([{ id: 'n1', text: 'hi' } as Note])
    await saveNotes([])
    expect(await idbGet('notes')).toEqual({ notes: [] })
  })
  it('posts to the server in local mode and leaves IndexedDB alone', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    await saveNotes([{ id: 'n1', text: 'hi' } as Note])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/notes')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ notes: [{ id: 'n1', text: 'hi' } as Note] })
    expect(await idbGet('notes')).toEqual({ notes: [] })
  })
  it('throws in local mode when the server rejects', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(saveNotes([{ id: 'n1', text: 'hi' } as Note])).rejects.toThrow('/api/notes 500')
  })
})

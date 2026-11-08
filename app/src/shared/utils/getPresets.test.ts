import { getPresets } from './getPresets'
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

describe('getPresets', () => {
  it('returns the empty default in browser mode when nothing is saved', async () => {
    await idbSet('presets', undefined)
    expect(await getPresets()).toEqual({})
  })
  it('reads what is stored in IndexedDB', async () => {
    await idbSet('presets', { tool: [{ name: 'A', data: { x: 1 } }] })
    expect(await getPresets()).toEqual({ tool: [{ name: 'A', data: { x: 1 } }] })
  })
  it('reads from the server in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = okJson({ tool: [{ name: 'A', data: { x: 1 } }] })
    vi.stubGlobal('fetch', fetchMock)
    expect(await getPresets()).toEqual({ tool: [{ name: 'A', data: { x: 1 } }] })
    expect(fetchMock).toHaveBeenCalledWith('/api/presets')
  })
  it('throws in local mode when the server fails', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(500))
    await expect(getPresets()).rejects.toThrow('/api/presets 500')
  })
})

import { savePresets } from './savePresets'
import { idbGet } from './idbGet'
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

const failing = (status: number) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: false, status, json: async () => ({}) }))

describe('savePresets', () => {
  it('creates the list for a new key', async () => {
    await savePresets('tool', [{ name: 'A', data: { x: 1 } }])
    expect(await idbGet('presets')).toEqual({ tool: [{ name: 'A', data: { x: 1 } }] })
  })
  it('keeps other keys and replaces only its own', async () => {
    await idbSet('presets', { other: [{ name: 'O', data: {} }], tool: [{ name: 'Old', data: {} }] })
    await savePresets('tool', [{ name: 'New', data: { y: 2 } }])
    expect(await idbGet('presets')).toEqual({ other: [{ name: 'O', data: {} }], tool: [{ name: 'New', data: { y: 2 } }] })
  })
  it('posts the key and list in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({}) }))
    vi.stubGlobal('fetch', fetchMock)
    await savePresets('tool', [{ name: 'A', data: {} }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/presets')
    expect(JSON.parse(init?.body as string)).toEqual({ key: 'tool', presets: [{ name: 'A', data: {} }] })
    expect(await idbGet('presets')).toEqual({})
  })
  it('throws in local mode when the server rejects', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', failing(400))
    await expect(savePresets('tool', [])).rejects.toThrow('/api/presets 400')
  })
})

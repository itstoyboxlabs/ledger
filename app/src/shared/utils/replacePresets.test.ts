import { replacePresets } from './replacePresets'
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

const okJson = (body: unknown) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => body }))
const failing = (status: number) => vi.fn(async (_url: string, _init?: RequestInit) => ({ ok: false, status, json: async () => ({}) }))

describe('replacePresets', () => {
  it('replaces the whole presets object', async () => {
    await idbSet('presets', { old: [{ name: 'Gone', data: {} }] })
    await replacePresets({ tool: [{ name: 'A', data: { x: 1 } }] })
    expect(await idbGet('presets')).toEqual({ tool: [{ name: 'A', data: { x: 1 } }] })
  })
  it('can clear presets with an empty object', async () => {
    await replacePresets({ a: [] })
    await replacePresets({})
    expect(await idbGet('presets')).toEqual({})
  })
})

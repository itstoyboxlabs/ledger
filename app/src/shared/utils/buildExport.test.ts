import { buildExport } from './buildExport'
import { seedStorage } from '@/test-utils/seedStorage'
import { storageModeStore } from '@/shared/state/storageModeStore'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('buildExport', () => {
  it('bundles everything saved, with a version and timestamp', async () => {
    await seedStorage({
      budget: { rows: [{ id: 'r1' }] },
      log: { entries: [{ id: 'l1' }] },
      notes: { notes: [{ id: 'n1' }] },
      presets: { tool: [] },
    })
    localStorage.setItem('ledger:flag', 'true')
    localStorage.setItem('unrelated', '1')
    const f = await buildExport()
    expect(f.version).toBe(1)
    expect(Number.isNaN(Date.parse(f.exportedAt))).toBe(false)
    expect(f.settings).toEqual({
      budget: { rows: [{ id: 'r1' }] },
      notes: { notes: [{ id: 'n1' }] },
      presets: { tool: [] },
      log: { entries: [{ id: 'l1' }] },
      local: { 'ledger:flag': true },
    })
  })
  it('uses null for a part that fails to load', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', vi.fn(async (url) => (url === '/api/log'
      ? { ok: false, status: 500, json: async () => ({}) }
      : { ok: true, status: 200, json: async () => ({ ok: url }) })))
    const f = await buildExport()
    expect(f.settings.log).toBeNull()
    expect(f.settings.budget).toEqual({ ok: '/api/budget' })
  })
})

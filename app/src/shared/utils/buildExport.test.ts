import { buildExport } from './buildExport'
import { seedStorage } from '@/test-utils/seedStorage'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { validateDataFile } from './validateDataFile'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
})

const tx = { id: 'a', date: '2026-01-01', account: 'chk', amount: 10, kind: 'expense' }

describe('buildExport', () => {
  it('puts the statements and the settings in one file, shaped like the sample', async () => {
    await seedStorage({
      data: { updated: '2026-01-31', notes: ['Hi'], accounts: { chk: { name: 'C', bank: 'B', type: 'checking', last4: '1' } }, merchants: { M: 'm.com' }, periods: {}, subscriptions: [], transactions: [tx] },
      budget: { rows: [{ id: 'r1' }] },
    })
    const f = await buildExport()
    expect(Object.keys(f)).toEqual(['version', 'exportedAt', 'updated', 'notes', 'accounts', 'merchants', 'periods', 'subscriptions', 'transactions', 'settings'])
    expect(f.transactions).toEqual([tx])
    expect(f.merchants).toEqual({ M: 'm.com' })
    expect(f.settings.budget).toEqual({ rows: [{ id: 'r1' }] })
    expect(() => validateDataFile(f)).not.toThrow()
  })
  it('has only settings when no statements are stored', async () => {
    const f = await buildExport()
    expect(f.transactions).toBeUndefined()
    expect(f.settings).toBeDefined()
  })
  it('reads the data folder in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    vi.stubGlobal('fetch', vi.fn(async (url) => ({
      ok: true,
      status: 200,
      json: async () => (url === '/api/transactions' ? { version: 1, accounts: { chk: { name: 'C' } }, transactions: [tx] } : { from: url }),
    })))
    const f = await buildExport()
    expect(f.transactions).toEqual([tx])
    expect(f.settings.budget).toEqual({ from: '/api/budget' })
    expect(f.settings.presets).toEqual({ from: '/api/presets' })
  })
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

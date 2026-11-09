import { importDataFile } from './importDataFile'
import { getBudget } from './getBudget'
import { getPresets } from './getPresets'
import { getAccounts } from './getAccounts'
import { getData } from './getData'
import { getAllTxns } from './getAllTxns'
import { applyData } from './applyData'
import { buildExport } from './buildExport'
import { clearStoredData } from './clearStoredData'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'

const tx = (id: string, date: string) => ({ id, date, account: 'chk', amount: 10, kind: 'spend' })

beforeEach(async () => {
  await seedStorage()
  applyData({ accounts: {}, transactions: [] })
})
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
})

describe('importDataFile', () => {
  it('imports a data file', async () => {
    const r = await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01'), tx('b', '2026-01-02')] })
    expect(r).toEqual({ transactions: 2, data: true, settings: false })
    expect((await getData())?.transactions).toHaveLength(2)
    expect(getAllTxns()).toHaveLength(2)
  })
  it('imports a settings file without touching data', async () => {
    const r = await importDataFile({ version: 1, settings: { budget: { rows: [{ id: 'r1' }] } } })
    expect(r).toEqual({ transactions: 0, data: false, settings: true })
    expect(await getBudget()).toEqual({ rows: [{ id: 'r1' }] })
    expect(await getData()).toBeNull()
  })
  it('keeps the tutorial nudge acknowledged unless the file says otherwise', async () => {
    localStorage.setItem('ledger:tutorialAck', 'true')
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [] } } })
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('true')
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [] }, local: { 'ledger:tutorialAck': false } } })
    expect(localStorage.getItem('ledger:tutorialAck')).toBe('false')
  })
  it('does both when the file has both', async () => {
    const r = await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [] } } })
    expect(r).toEqual({ transactions: 1, data: true, settings: true })
  })
  it('replaces the sample and every sample setting, even with a statements-only file', async () => {
    await importDataFile({
      version: 1,
      accounts: { fake: { name: 'Sample checking' } },
      transactions: [{ ...tx('s1', '2026-01-01'), account: 'fake' }],
      settings: { budget: { rows: [{ id: 'sample' }] }, presets: { budget: [{ name: 'Today', data: {} }] }, local: { 'ledger:age': 25 } },
    }, { sample: true })
    localStorage.setItem('ledger:accounts', JSON.stringify(['fake']))
    const r = await importDataFile({ version: 1, accounts: { chk: { name: 'Mine' } }, transactions: [tx('a', '2026-02-01')] })
    expect(r).toEqual({ transactions: 1, data: true, settings: false })
    expect(getAllTxns().map((t) => t.id)).toEqual(['a'])
    expect(Object.keys(getAccounts())).toEqual(['chk'])
    expect((await getData())?.transactions?.map((t) => t.id)).toEqual(['a'])
    expect(await getBudget()).toEqual({ rows: [], dismissedSubs: {} })
    expect(await getPresets()).toEqual({})
    expect(localStorage.getItem('ledger:age')).toBeNull()
    expect(localStorage.getItem('ledger:accounts')).toBeNull()
  })
  it('replaces the statements and keeps the settings for a statements-only file over your own data', async () => {
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [{ id: 'mine' }] }, local: { 'ledger:age': 33 } } })
    const r = await importDataFile({ version: 1, transactions: [tx('b', '2026-02-01')] })
    expect(r).toEqual({ transactions: 1, data: true, settings: false })
    expect(getAllTxns().map((t) => t.id)).toEqual(['b'])
    expect(await getBudget()).toEqual({ rows: [{ id: 'mine' }] })
    expect(localStorage.getItem('ledger:age')).toBe('33')
  })
  it('replaces everything with a full file, so settings it lacks go back to defaults', async () => {
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [{ id: 'old' }] }, presets: { budget: [{ name: 'Old', data: {} }] } } })
    localStorage.setItem('ledger:age', '40')
    await importDataFile({ version: 1, transactions: [tx('b', '2026-02-01')], settings: { budget: { rows: [{ id: 'new' }] } } })
    expect(getAllTxns().map((t) => t.id)).toEqual(['b'])
    expect(await getBudget()).toEqual({ rows: [{ id: 'new' }] })
    expect(await getPresets()).toEqual({})
    expect(localStorage.getItem('ledger:age')).toBeNull()
  })
  it('round trips an export: clear, upload it and the export comes back the same', async () => {
    await importDataFile({
      version: 1,
      updated: '2026-01-31',
      notes: ['Made up.'],
      accounts: { chk: { name: 'Checking', bank: 'B', type: 'checking' as never, last4: '1234' } },
      merchants: { M: 'm.com' },
      periods: { 'chk-2026-01': { account: 'chk', start: '2026-01-01', end: '2026-01-31' } },
      subscriptions: [],
      transactions: [tx('a', '2026-01-01')],
      settings: { budget: { rows: [{ id: 'r1' }], dismissedSubs: {} }, presets: { budget: [{ name: 'P', data: {} }] }, local: { 'ledger:age': { age: 30, asOf: 2026 } } },
    } as never)
    const first = await buildExport()
    await clearStoredData('all')
    expect(getAllTxns()).toHaveLength(0)
    await importDataFile(JSON.parse(JSON.stringify(first)))
    const second = await buildExport()
    expect({ ...second, exportedAt: '' }).toEqual({ ...first, exportedAt: '' })
    expect(second.settings.local).toEqual({ 'ledger:age': { age: 30, asOf: 2026 } })
    expect(second.updated).toBe('2026-01-31')
  })
  it('applies the settings the file carries after the wipe', async () => {
    localStorage.setItem('ledger:old', '1')
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [{ id: 'r1' }] }, local: { 'ledger:age': 30 } } })
    expect(await getBudget()).toEqual({ rows: [{ id: 'r1' }] })
    expect(localStorage.getItem('ledger:age')).toBe('30')
    expect(localStorage.getItem('ledger:old')).toBeNull()
  })
  it('keeps the statements but replaces every setting for a settings-only file', async () => {
    await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { presets: { budget: [{ name: 'Old', data: {} }] } } })
    localStorage.setItem('ledger:age', '40')
    await importDataFile({ version: 1, settings: { budget: { rows: [{ id: 'r2' }] } } })
    expect(getAllTxns().map((t) => t.id)).toEqual(['a'])
    expect(await getBudget()).toEqual({ rows: [{ id: 'r2' }] })
    expect(await getPresets()).toEqual({})
    expect(localStorage.getItem('ledger:age')).toBeNull()
  })
  it('notes in an uploaded file survive an export', async () => {
    const notes = [{ id: 'n1', text: 'keep me', pinned: true }]
    await importDataFile({ version: 1, notes: ['top level'], transactions: [tx('a', '2026-01-01')], settings: { notes: { notes } } })
    const out = await buildExport()
    expect(out.settings?.notes).toEqual({ notes })
    expect(out.notes).toEqual(['top level'])
  })
  it('throws in local mode and changes nothing', async () => {
    storageModeStore.setState({ mode: 'local' })
    await expect(importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')] })).rejects.toThrow('Importing is off in local mode')
    expect(getAllTxns()).toHaveLength(0)
  })
  it('throws on an invalid file', async () => {
    await expect(importDataFile({ version: 1 })).rejects.toThrow('no transactions or settings')
    await expect(importDataFile(null)).rejects.toThrow('not a ledger file')
    expect(await getData()).toBeNull()
  })
})

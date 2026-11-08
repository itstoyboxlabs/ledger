import { importDataFile } from './importDataFile'
import { getBudget } from './getBudget'
import { getData } from './getData'
import { getAllTxns } from './getAllTxns'
import { applyData } from './applyData'
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
  it('does both when the file has both', async () => {
    const r = await importDataFile({ version: 1, transactions: [tx('a', '2026-01-01')], settings: { budget: { rows: [] } } })
    expect(r).toEqual({ transactions: 1, data: true, settings: true })
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

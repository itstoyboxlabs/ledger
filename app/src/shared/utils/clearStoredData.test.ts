import { clearStoredData } from './clearStoredData'
import { applyData } from './applyData'
import { getAllTxns } from './getAllTxns'
import { getBudget } from './getBudget'
import { getData } from './getData'
import { getLog } from './getLog'
import { getNotes } from './getNotes'
import { getPresets } from './getPresets'
import { persistedStore } from '@/shared/state/persistedStore'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'

const tx = { id: 'a', date: '2026-01-01', account: 'chk', amount: 10, kind: 'spend' }
const data = { accounts: { chk: { name: 'Checking' } }, transactions: [tx] }

beforeEach(async () => {
  await seedStorage({
    data,
    budget: { rows: [{ id: 'r1' }] },
    log: { entries: [{ id: 'l1' }] },
    notes: { notes: [{ id: 'n1' }] },
    presets: { budget: [{ name: 'A', data: {} }] },
  })
  applyData(data as never)
  localStorage.setItem('ledger:age', '25')
  localStorage.setItem('other-app', 'keep')
  persistedStore.setState({ entries: { age: { value: 25, raw: '25' } } })
})
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
})

describe('clearStoredData', () => {
  it('removes statements, settings and every ledger key', async () => {
    await clearStoredData('all')
    expect(await getData()).toBeNull()
    expect(getAllTxns()).toEqual([])
    expect(await getBudget()).toEqual({ rows: [], dismissedSubs: {} })
    expect(await getLog()).toEqual({ entries: [] })
    expect(await getNotes()).toEqual({ notes: [] })
    expect(await getPresets()).toEqual({})
    expect(localStorage.getItem('ledger:age')).toBeNull()
    expect(persistedStore.getState().entries).toEqual({})
  })
  it('leaves keys that are not Ledger’s alone', async () => {
    await clearStoredData('all')
    expect(localStorage.getItem('other-app')).toBe('keep')
  })
  it('keeps the statements when only the settings are cleared', async () => {
    await clearStoredData('settings')
    expect((await getData())?.transactions).toHaveLength(1)
    expect(getAllTxns()).toHaveLength(1)
    expect(await getPresets()).toEqual({})
    expect(localStorage.getItem('ledger:age')).toBeNull()
  })
  it('refuses in local mode', async () => {
    storageModeStore.setState({ mode: 'local' })
    await expect(clearStoredData('all')).rejects.toThrow('off in local mode')
    expect(localStorage.getItem('ledger:age')).toBe('25')
  })
})

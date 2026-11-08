import { setData } from './setData'
import { idbGet } from './idbGet'
import { storageModeStore } from '@/shared/state/storageModeStore'
import { seedStorage } from '@/test-utils/seedStorage'
import type { TransactionsData } from '@/shared/types/TransactionsData'

beforeEach(() => seedStorage())
afterEach(() => {
  storageModeStore.setState({ mode: 'browser' })
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})


describe('setData', () => {
  it('writes the data file to IndexedDB in browser mode', async () => {
    const data = { accounts: {}, transactions: [{ id: 't1' }] } as unknown as TransactionsData
    await setData(data)
    expect(await idbGet('data')).toEqual(data)
  })
  it('does nothing in local mode, with no request and no write', async () => {
    storageModeStore.setState({ mode: 'local' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await setData({ transactions: [{ id: 'x' }] } as unknown as TransactionsData)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await idbGet('data')).toBeNull()
  })
})

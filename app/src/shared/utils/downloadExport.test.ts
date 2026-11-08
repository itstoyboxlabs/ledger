import { downloadExport } from './downloadExport'
import { saveBudget } from './saveBudget'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage({ data: { accounts: {}, merchants: {}, periods: {}, subscriptions: [], transactions: [{ id: 'a', date: '2026-01-01', account: 'chk', amount: 5, kind: 'expense' }] } }))
afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('downloadExport', () => {
  it('downloads one ledger-data.json with the statements and the saved budget', async () => {
    URL.createObjectURL ??= () => ''
    URL.revokeObjectURL ??= () => {}
    await saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const link = document.createElement('a')
    vi.spyOn(link, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(link)

    await downloadExport()

    expect(link.download).toBe('ledger-data.json')
    const blob = create.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json')
    const file = JSON.parse(await blob.text())
    expect(file.version).toBe(1)
    expect(file.transactions.map((t: { id: string }) => t.id)).toEqual(['a'])
    expect(file.settings.budget.rows).toEqual([{ id: 'r1', name: 'Rent', amount: 1000 }])
  })
})

import { loadSampleData } from '@/test-utils/loadSampleData'
import type { Transaction } from '@/shared/types/Transaction'
import { exportCsv } from '@/screens/spending/utils/exportCsv'

describe('exportCsv', () => {
  let blobs: Blob[]
  let anchor: HTMLAnchorElement | null
  beforeEach(() => {
    loadSampleData()
    blobs = []
    URL.createObjectURL = vi.fn((b: Blob) => { blobs.push(b); return 'blob:x' })
    URL.revokeObjectURL = vi.fn()
    anchor = null
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { anchor = this })
  })
  afterEach(() => vi.restoreAllMocks())

  const run = async (txns: Partial<Transaction>[], name = 'out.csv') => {
    exportCsv(txns as Transaction[], name)
    return (blobs[0] as Blob).text()
  }

  it('writes a header and signed amounts with account names', async () => {
    const text = await run([
      { date: '2026-05-01', merchant: 'Cafe', desc: 'CAFE 1', cat: 'Food & Dining', sub: 'Coffee', account: 'cc', kind: 'expense', amount: 4.5 },
      { date: '2026-05-02', merchant: 'Cafe', desc: 'REFUND', cat: 'Food & Dining', sub: 'Coffee', account: 'cc', kind: 'refund', amount: 4.5 },
    ])
    const [head, a, b] = text.split('\n')
    expect(head).toBe('date,merchant,description,category,subcategory,account,kind,amount')
    expect(a).toBe('"2026-05-01","Cafe","CAFE 1","Food & Dining","Coffee","Maple Card","expense","4.50"')
    expect(b?.endsWith('"-4.50"')).toBe(true)
  })
  it('escapes quotes and blanks missing fields', async () => {
    const text = await run([{ date: '2026-05-01', merchant: 'Joe "J" Bar', cat: 'Other', account: 'chk', kind: 'expense', amount: 1 }])
    const row = text.split('\n')[1] as string
    expect(row).toContain('"Joe ""J"" Bar"')
    expect(row).toContain('"",')
  })
  it('exports only the header for no rows', async () => {
    expect(await run([])).toBe('date,merchant,description,category,subcategory,account,kind,amount')
  })
  it('downloads under the given name and releases the url', async () => {
    await run([], 'my.csv')
    expect(anchor?.download).toBe('my.csv')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
  })
})

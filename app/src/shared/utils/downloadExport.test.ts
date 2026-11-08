import { downloadExport } from './downloadExport'
import { saveBudget } from './saveBudget'
import { seedStorage } from '@/test-utils/seedStorage'

beforeEach(() => seedStorage())
afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('downloadExport', () => {
  it('downloads ledger-settings.json containing the saved budget', async () => {
    URL.createObjectURL ??= () => ''
    URL.revokeObjectURL ??= () => {}
    await saveBudget({ rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] })
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const link = document.createElement('a')
    vi.spyOn(link, 'click').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue(link)

    await downloadExport()

    expect(link.download).toBe('ledger-settings.json')
    const blob = create.mock.calls[0][0] as Blob
    expect(blob.type).toBe('application/json')
    const file = JSON.parse(await blob.text())
    expect(file.version).toBe(1)
    expect(file.settings.budget.rows).toEqual([{ id: 'r1', name: 'Rent', amount: 1000 }])
  })
})

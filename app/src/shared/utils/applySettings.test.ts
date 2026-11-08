import { applySettings } from './applySettings'
import { getBudget } from './getBudget'
import { getLog } from './getLog'
import { getNotes } from './getNotes'
import { getPresets } from './getPresets'
import { seedStorage } from '@/test-utils/seedStorage'
import type { BudgetRow } from '@/shared/types/BudgetRow'
import type { Note } from '@/shared/types/Note'
import type { LogEntry } from '@/shared/types/LogEntry'
import type { ExportSettings } from '@/shared/types/ExportSettings'

beforeEach(() => seedStorage())
afterEach(() => localStorage.clear())

describe('applySettings', () => {
  it('does nothing for an empty argument', async () => {
    await expect(applySettings(undefined)).resolves.toBeUndefined()
    await expect(applySettings(null)).resolves.toBeUndefined()
  })
  it('saves every section that is present', async () => {
    await applySettings({
      budget: { rows: [{ id: 'r1' } as BudgetRow] },
      notes: { notes: [{ id: 'n1' } as Note] },
      presets: { tool: [{ name: 'A', data: {} }] },
      log: { entries: [{ id: 'l1' } as LogEntry] },
    })
    expect(await getBudget()).toEqual({ rows: [{ id: 'r1' }] })
    expect(await getNotes()).toEqual({ notes: [{ id: 'n1' }] })
    expect(await getPresets()).toEqual({ tool: [{ name: 'A', data: {} }] })
    expect(await getLog()).toEqual({ entries: [{ id: 'l1' }] })
  })
  it('accepts notes and log as bare arrays', async () => {
    await applySettings({ notes: [{ id: 'n1' } as Note], log: [{ id: 'l1' } as LogEntry] })
    expect(await getNotes()).toEqual({ notes: [{ id: 'n1' }] })
    expect(await getLog()).toEqual({ entries: [{ id: 'l1' }] })
  })
  it('leaves sections that are absent or malformed alone', async () => {
    await seedStorage({ budget: { rows: [{ id: 'keep' }] }, notes: { notes: [{ id: 'keep' }] } })
    // wrong shapes on purpose
    await applySettings({ budget: { rows: 'bad' }, notes: 'bad', presets: [] } as unknown as ExportSettings)
    expect(await getBudget()).toEqual({ rows: [{ id: 'keep' }] })
    expect(await getNotes()).toEqual({ notes: [{ id: 'keep' }] })
    expect(await getPresets()).toEqual({})
  })
  it('writes only ledger: keys to localStorage, as JSON', async () => {
    await applySettings({ local: { 'ledger:a': { x: 1 }, 'evil:b': 2 } })
    expect(JSON.parse(localStorage.getItem('ledger:a') ?? 'null')).toEqual({ x: 1 })
    expect(localStorage.getItem('evil:b')).toBeNull()
  })
})

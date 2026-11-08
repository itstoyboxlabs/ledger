import { screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData, SAMPLE } from '@/test-utils/loadSampleData'
import { seedStorage } from '@/test-utils/seedStorage'
import { getLog } from '@/shared/utils/getLog'
import { getBudget } from '@/shared/utils/getBudget'
import * as getLogModule from '@/shared/utils/getLog'
import { saveLog } from '@/shared/utils/saveLog'
import { saveBudget } from '@/shared/utils/saveBudget'

const SEED_LOG = [
  { id: 'l1', date: '2026-11-05', amount: 40, note: 'big shop', rowId: 'b005', createdAt: 1 },
  { id: 'l2', date: '2026-11-06', amount: 12.5, note: 'burrito', rowId: 'b006', createdAt: 2 },
  { id: 'l3', date: '2026-10-20', amount: 9, note: 'old one', rowId: 'b006', createdAt: 3 },
]
import { LogView } from './LogView'

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

const open = async () => {
  const user = userEvent.setup()
  renderApp(<LogView />)
  await screen.findByText('Log a purchase')
  return user
}

describe('LogView', () => {
  beforeEach(async () => {
    localStorage.clear()
    await seedStorage({ log: { entries: SEED_LOG }, budget: SAMPLE.settings.budget })
    loadSampleData()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-08T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('shows the month total and only this month\'s entries', async () => {
    await open()
    expect(screen.getByText(/across/)).toHaveTextContent('Logged $52.50 across 2 entries')
    expect(screen.getByText('big shop')).toBeInTheDocument()
    expect(screen.getByText('burrito')).toBeInTheDocument()
    expect(screen.queryByText('old one')).not.toBeInTheDocument()
  })

  it('shows meters for unscheduled rows with what is left', async () => {
    await open()
    expect(screen.getByText('Unexpected')).toBeInTheDocument()
    expect(screen.getByText(/of \$450/)).toBeInTheDocument() // Groceries
    expect(screen.getByText('$410 left')).toBeInTheDocument()
  })

  it('moves back a month and disables next on the current month', async () => {
    const user = await open()
    expect(screen.getByTitle('Next month')).toBeDisabled()
    await user.click(screen.getByTitle('Previous month'))
    expect(screen.getByText('old one')).toBeInTheDocument()
    expect(screen.queryByText('burrito')).not.toBeInTheDocument()
    expect(screen.getByTitle('Next month')).toBeEnabled()
  })

  it('keeps Add disabled until an amount is entered, then logs and saves', async () => {
    const user = await open()
    const add = screen.getByRole('button', { name: 'Add' })
    expect(add).toBeDisabled()
    await user.type(screen.getByPlaceholderText('14.50'), '3.456')
    await user.type(screen.getByPlaceholderText('burrito'), '  coffee ')
    expect(add).toBeEnabled()
    await user.click(add)
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('14.50')).toHaveValue('')
    await waitFor(async () => expect((await getLog()).entries.some((x) => x.note === 'coffee')).toBe(true), { timeout: 2000 })
    const e = (await getLog()).entries.find((x) => x.note === 'coffee')
    expect(e).toMatchObject({ amount: 3.46, date: '2026-11-08' })
  })

  it('accepts a negative amount as a credit', async () => {
    const user = await open()
    await user.type(screen.getByPlaceholderText('14.50'), '-5')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText(/across/)).toHaveTextContent('Logged $47.50 across 3 entries')
  })

  it('deletes an entry', async () => {
    const user = await open()
    const row = screen.getByText('burrito').closest('tr')
    await user.click(within(row as HTMLElement).getByTitle('Delete entry'))
    expect(screen.queryByText('burrito')).not.toBeInTheDocument()
    expect(screen.getByText(/across/)).toHaveTextContent('Logged $40.00 across 1 entry')
  })

  it('hides a meter, saves trackInLog on the budget row, and can restore it', async () => {
    const user = await open()
    await user.click(screen.getByRole('button', { name: 'Hide the Unexpected meter' }))
    expect(screen.getByText(/Hidden meters/)).toBeInTheDocument()
    const trackInLog = async () => (await getBudget()).rows.find((r) => r.name === 'Unexpected')?.trackInLog
    await waitFor(async () => expect(await trackInLog()).toBe(false), { timeout: 3000 })
    await user.click(screen.getByTitle('Show the Unexpected meter again'))
    await waitFor(async () => expect(await trackInLog()).toBe(true), { timeout: 3000 })
  })

  it('sorts the table by amount when the header is clicked', async () => {
    const user = await open()
    await user.click(screen.getByRole('columnheader', { name: /^Amount/ }))
    const rowsText = () => screen.getAllByRole('row').slice(1, 3).map((r) => r.textContent)
    expect(rowsText()[0]).toContain('big shop') // amount descending first
    await user.click(screen.getByRole('columnheader', { name: /^Amount/ }))
    expect(rowsText()[0]).toContain('burrito')
  })

  it('logs a typed future date as today', async () => {
    const user = await open()
    await user.type(screen.getByPlaceholderText('14.50'), '7')
    await user.type(screen.getByPlaceholderText('burrito'), 'tickets')
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-12-25' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('tickets')).toBeInTheDocument()
    await waitFor(async () => expect((await getLog()).entries.find((x) => x.note === 'tickets')?.date).toBe('2026-11-08'), { timeout: 2000 })
  })

  it('keeps entries another tab saved after this page loaded', async () => {
    const user = await open()
    await saveLog([...SEED_LOG, { id: 'other', date: '2026-11-07', amount: 5, note: 'from other tab', rowId: 'b008', createdAt: 9 }])
    await user.type(screen.getByPlaceholderText('14.50'), '3')
    await user.type(screen.getByPlaceholderText('burrito'), 'gum')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(async () => {
      const notes = (await getLog()).entries.map((x) => x.note)
      expect(notes).toEqual(expect.arrayContaining(['gum', 'from other tab', 'big shop']))
    }, { timeout: 2000 })
    expect(await screen.findByText('from other tab')).toBeInTheDocument()
  })

  it('hiding a meter keeps Budget edits made after the page loaded', async () => {
    const user = await open()
    const fresh = await getBudget()
    await saveBudget({ ...fresh, rows: fresh.rows.map((r) => (r.name === 'Rent' ? { ...r, amount: 1999 } : r)) })
    await user.click(screen.getByRole('button', { name: 'Hide the Unexpected meter' }))
    await waitFor(async () => {
      const rows = (await getBudget()).rows
      expect(rows.find((r) => r.name === 'Unexpected')?.trackInLog).toBe(false)
      expect(rows.find((r) => r.name === 'Rent')?.amount).toBe(1999)
    }, { timeout: 3000 })
  })

  it('keeps the meter of a dated row whose entries net to zero', async () => {
    await seedStorage({
      log: { entries: [
        { id: 'e1', date: '2026-11-02', amount: 10, note: 'charge', rowId: 'b003', createdAt: 1 },
        { id: 'e2', date: '2026-11-03', amount: -10, note: 'refund', rowId: 'b003', createdAt: 2 },
      ] },
      budget: SAMPLE.settings.budget,
    })
    await open()
    expect(screen.getByRole('button', { name: 'Hide the Electricity meter' })).toBeInTheDocument()
  })

  it('names the row of an entry on a hidden budget row', async () => {
    const budget = structuredClone(SAMPLE.settings.budget)
    budget.rows.push({ id: 'b099', name: 'Old gym', type: 'simple', amount: 20, source: 'manual', hidden: true })
    await seedStorage({ log: { entries: [{ id: 'e1', date: '2026-11-02', amount: 20, note: 'last month fee', rowId: 'b099', createdAt: 1 }] }, budget })
    await open()
    const row = screen.getByText('last month fee').closest('tr') as HTMLElement
    expect(within(row).getByText('Old gym')).toBeInTheDocument()
    expect(screen.queryByText('Removed row')).not.toBeInTheDocument()
  })

  it('shows a load error with a retry', async () => {
    const spy = vi.spyOn(getLogModule, 'getLog').mockRejectedValueOnce(new Error('offline'))
    const user = userEvent.setup()
    renderApp(<LogView />)
    expect(await screen.findByText('Could not load the log.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Log a purchase')).toBeInTheDocument()
    spy.mockRestore()
  })
})

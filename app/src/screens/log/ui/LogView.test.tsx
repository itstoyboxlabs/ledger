import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData, SAMPLE } from '@/test-utils/loadSampleData'
import { seedStorage } from '@/test-utils/seedStorage'
import { getLog } from '@/shared/utils/getLog'
import { getBudget } from '@/shared/utils/getBudget'

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
})

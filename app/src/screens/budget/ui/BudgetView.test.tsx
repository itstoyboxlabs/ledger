import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { loadSampleData, SAMPLE } from '@/test-utils/loadSampleData'
import { seedStorage } from '@/test-utils/seedStorage'
import { getBudget } from '@/shared/utils/getBudget'

import { BudgetView } from './BudgetView'

globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
globalThis.HTMLElement.prototype.scrollIntoView ??= () => {}

const open = async (props = {}) => {
  const user = userEvent.setup()
  const fns = { goToTools: vi.fn(), goToLog: vi.fn(), ...props }
  renderApp(<BudgetView {...fns} />)
  await screen.findByDisplayValue('Rent')
  return { user, ...fns }
}
const names = () => screen.getAllByPlaceholderText('name').map((i) => (i as HTMLInputElement).value)

describe('BudgetView', () => {
  beforeEach(async () => {
    localStorage.clear()
    loadSampleData()
    await seedStorage({ budget: SAMPLE.settings.budget })
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-08T12:00:00'))
  })
  afterEach(() => vi.useRealTimers())

  it('lists the budget rows from storage', async () => {
    await open()
    expect(names()).toEqual(expect.arrayContaining(['Rent', 'Groceries', 'Restaurants', 'Transit', 'Unexpected']))
    expect(screen.getByText('Monthly income')).toBeInTheDocument()
  })

  it('shows the Actual and Diff columns in compare mode', async () => {
    const { user } = await open()
    expect(screen.queryByText('Diff')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Compare to actual/ }))
    expect(screen.getByText('Diff')).toBeInTheDocument()
    expect(screen.getAllByText(/^Actual/).length).toBeGreaterThan(0)
    expect(localStorage.getItem('ledger:budgetCompareMode')).toBe('true')
  })

  it('remaining mode hides a bill whose day has passed', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: /Remaining this month/ }))
    expect(localStorage.getItem('ledger:restMode')).toBe('true')
    expect(screen.getByRole('button', { name: /Compare to actual/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('removes a row and saves the budget', async () => {
    const { user } = await open()
    const row = screen.getByDisplayValue('Unexpected').closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Remove row' }))
    expect(names()).not.toContain('Unexpected')
    await waitFor(async () => expect((await getBudget()).rows.some((r) => r.name === 'Unexpected')).toBe(false), { timeout: 3000 })
  })

  it('adds a row through the Add expense modal', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: '+ Add row' }))
    await user.type(await screen.findByPlaceholderText('e.g. Gym membership'), 'Pets')
    await user.type(screen.getByPlaceholderText('0.00'), '70')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(names()).toContain('Pets')
  })

  it('opens the editor for a stack row and Cancel restores it', async () => {
    const { user } = await open()
    const row = screen.getByDisplayValue('Transit').closest('tr')!
    await user.click(within(row).getByRole('button', { name: 'Edit sub items' }))
    expect(await screen.findByText('Add what makes up this row. The budget updates as you type.')).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Remove sub item' })[0])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    const after = screen.getByDisplayValue('Transit').closest('tr')!
    expect(within(after).getByTitle('Built from its sub items. Click to edit.')).toHaveTextContent('120')
  })

  it('shows not-budgeted ghost rows for spending no row claims', async () => {
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: /Compare to actual/ }))
    expect(screen.getByText('Not budgeted total')).toBeInTheDocument()
  })
})

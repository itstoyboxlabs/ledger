import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { ToolsView } from './ToolsView'

// the calculators have their own tests; stand them in so this file checks only the page
vi.mock('@/screens/tools/features/take-home/ui/TakeHomeCalc', () => ({ TakeHomeCalc: () => <div data-testid="tool-takehome" /> }))
vi.mock('@/screens/tools/features/cash-range/ui/CashRangeCalc', () => ({ CashRangeCalc: () => <div data-testid="tool-cash" /> }))
vi.mock('@/screens/tools/features/rent-scenario/ui/RentScenarioCalc', () => ({ RentScenarioCalc: () => <div data-testid="tool-rentscenarios" /> }))
vi.mock('@/screens/tools/features/rent-to-income/ui/RentToIncomeCalc', () => ({ RentToIncomeCalc: () => <div data-testid="tool-renttoincome" /> }))
vi.mock('@/screens/tools/features/rental-cost/ui/RentalCostCalc', () => ({ RentalCostCalc: () => <div data-testid="tool-rentalcost" /> }))
vi.mock('@/screens/tools/features/debt-payoff/ui/DebtPayoffCalc', () => ({ DebtPayoffCalc: () => <div data-testid="tool-debt" /> }))
vi.mock('@/screens/tools/features/hourly/ui/HourlyCalc', () => ({ HourlyCalc: () => <div data-testid="tool-hourly" /> }))
vi.mock('@/screens/tools/features/stock/ui/StockCalc', () => ({ StockCalc: () => <div data-testid="tool-stock" /> }))
vi.mock('@/screens/tools/features/vacation/ui/VacationCalc', () => ({ VacationCalc: () => <div data-testid="tool-vacation" /> }))

beforeEach(async () => {
  await seedStorage()
  localStorage.clear()
})

const list = { id: 'l1', title: 'Gifts', description: 'For mom', items: [{ id: 'a', name: 'Scarf', amount: 30 }] }

describe('ToolsView', () => {
  it('shows every built-in tool by default', () => {
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    for (const id of ['takehome', 'cash', 'rentscenarios', 'renttoincome', 'rentalcost', 'debt', 'hourly', 'stock', 'vacation']) {
      expect(screen.getByTestId(`tool-${id}`)).toBeInTheDocument()
    }
  })
  it('only shows the saved selection', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['cash', 'debt']))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByTestId('tool-cash')).toBeInTheDocument()
    expect(screen.getByTestId('tool-debt')).toBeInTheDocument()
    expect(screen.queryByTestId('tool-hourly')).toBeNull()
  })
  it('says so when nothing is selected', () => {
    localStorage.setItem('ledger:toolsShown', '[]')
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByText(/Nothing selected/)).toBeInTheDocument()
  })
  it('wide tools span two columns and a lone tool does too', () => {
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByTestId('tool-cash').parentElement?.className).toContain('lg:col-span-2')
    expect(screen.getByTestId('tool-debt').parentElement?.className).not.toContain('lg:col-span-2')
  })
  it('a single visible tool is full width', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['debt']))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByTestId('tool-debt').parentElement?.className).toContain('lg:col-span-2')
  })
  it('shows the user lists and edits their items', async () => {
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Gifts' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Add item/ }))
    expect(JSON.parse(localStorage.getItem('ledger:lists') as string)[0].items).toHaveLength(2)
  })
  it('turns on a list that was added after the selection was saved', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['cash']))
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Gifts' })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).toEqual(['cash', 'l1'])
  })
  it('does not turn a list back on after it was seen and hidden', () => {
    localStorage.setItem('ledger:toolsShown', JSON.stringify(['cash']))
    localStorage.setItem('ledger:toolsSeen', JSON.stringify(['l1']))
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    expect(screen.queryByRole('heading', { name: 'Gifts' })).toBeNull()
  })
  it('edits a list title from the pencil button', async () => {
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    await userEvent.click(screen.getByTitle('Edit title and description'))
    expect(screen.getByText('Edit list')).toBeInTheDocument()
    await userEvent.type(screen.getByDisplayValue('Gifts'), ' 2026')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(JSON.parse(localStorage.getItem('ledger:lists') as string)[0].title).toBe('Gifts 2026')
    expect(screen.getByRole('heading', { name: 'Gifts 2026' })).toBeInTheDocument()
  })
  it('deleting a list asks first, then removes it everywhere', async () => {
    localStorage.setItem('ledger:lists', JSON.stringify([list]))
    renderApp(<ToolsView goToAboutYou={() => {}} />)
    await userEvent.click(screen.getByTitle('Delete list'))
    expect(screen.getByText(/Are you sure you want to delete "Gifts"/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'Gifts' })).toBeInTheDocument()
    await userEvent.click(screen.getByTitle('Delete list'))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.queryByRole('heading', { name: 'Gifts' })).toBeNull()
    expect(JSON.parse(localStorage.getItem('ledger:lists') as string)).toEqual([])
    expect(JSON.parse(localStorage.getItem('ledger:toolsShown') as string)).not.toContain('l1')
  })
})

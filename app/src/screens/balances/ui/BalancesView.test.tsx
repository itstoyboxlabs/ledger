import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { loadSampleData, SAMPLE } from '@/test-utils/loadSampleData'

import { BalancesView } from './BalancesView'

globalThis.ResizeObserver ??= class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }

const seed = (key: string, value: unknown) => localStorage.setItem(`ledger:${key}`, JSON.stringify(value))

describe('BalancesView', () => {
  beforeEach(async () => {
    await seedStorage({ budget: SAMPLE.settings.budget })
    localStorage.clear()
    loadSampleData()
  })

  it('says Retirement plans from your age on the As of date', () => {
    renderApp(<BalancesView />)
    expect(screen.getByText(/Retirement plans from your age on that day/)).toBeInTheDocument()
  })

  it('starts empty with zero totals', () => {
    renderApp(<BalancesView />)
    expect(screen.getByText('No debts yet.')).toBeInTheDocument()
    expect(screen.getByText('Nothing added yet.')).toBeInTheDocument()
    expect(screen.getByText('Total owed')).toBeInTheDocument()
    expect(screen.getByText('Total owned')).toBeInTheDocument()
  })

  it('adds a debt and an asset', async () => {
    renderApp(<BalancesView />)
    await userEvent.click(screen.getByRole('button', { name: /Add a debt/ }))
    expect(screen.getByPlaceholderText('Student loans')).toBeInTheDocument()
    expect(screen.queryByText('No debts yet.')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Add something you have/ }))
    expect(screen.getByPlaceholderText('Savings account')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ledger:assets') as string)).toHaveLength(1)
  })

  it('totals what is owned from saved assets', () => {
    seed('assets', [{ id: 'a1', name: 'Savings', balance: 2500 }, { id: 'a2', name: 'Roth', balance: 1000, pool: '401k' }])
    renderApp(<BalancesView />)
    expect(screen.getByText('$3,500.00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Savings')).toBeInTheDocument()
  })

  it('shows the account type of each asset, reading old 401k assets as pre-tax', () => {
    seed('assets', [
      { id: 'a1', name: 'Checking', balance: 2500 },
      { id: 'a2', name: 'Old 401k', balance: 1000, pool: '401k' },
      { id: 'a3', name: 'Roth IRA', balance: 500, pool: '401k', kind: 'roth' },
    ])
    renderApp(<BalancesView />)
    expect(screen.getByRole('combobox', { name: 'Account type for Checking' })).toHaveTextContent('Savings (use anytime)')
    expect(screen.getByRole('combobox', { name: 'Account type for Old 401k' })).toHaveTextContent('Pre-tax 401k or IRA (locked)')
    expect(screen.getByRole('combobox', { name: 'Account type for Roth IRA' })).toHaveTextContent('Roth 401k or IRA (locked)')
  })

  it('removes an asset and updates the total', async () => {
    seed('assets', [{ id: 'a1', name: 'Savings', balance: 2500 }])
    renderApp(<BalancesView />)
    await userEvent.click(screen.getByTitle('Remove'))
    expect(screen.getByText('Nothing added yet.')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('ledger:assets') as string)).toEqual([])
  })

  it('renames a debt and persists it', async () => {
    seed('debts', [{ id: 'd1', name: 'Card', balance: 1200, apr: 20, payment: 100, budgetRow: null }])
    renderApp(<BalancesView />)
    const name = screen.getByDisplayValue('Card')
    await userEvent.type(name, 's')
    expect(JSON.parse(localStorage.getItem('ledger:debts') as string)[0].name).toBe('Cards')
    expect(screen.getByText('$1,200.00')).toBeInTheDocument()
  })

  it('removes a debt', async () => {
    seed('debts', [{ id: 'd1', name: 'Card', balance: 1200, apr: 20, payment: 100, budgetRow: null }])
    renderApp(<BalancesView />)
    await userEvent.click(screen.getByTitle('Remove debt'))
    expect(screen.getByText('No debts yet.')).toBeInTheDocument()
  })

  it('shows the typed payment for a debt linked to a deleted Budget row', async () => {
    seed('debts', [{ id: 'd1', name: 'Car', balance: 9000, apr: 6, payment: 300, budgetRow: 'deleted-row' }])
    renderApp(<BalancesView />)
    // the same number debtPaymentOf gives Debt payoff and Retirement
    expect(await screen.findByDisplayValue('300')).toBeInTheDocument()
  })

  it('has no tax state card, picker or About you pointer', () => {
    localStorage.setItem('ledger:taxState', '"ca"')
    renderApp(<BalancesView />)
    expect(screen.queryByText(/Taxed in/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open About you' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^State/ })).not.toBeInTheDocument()
  })
})

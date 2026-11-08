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
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { loadSampleData, SAMPLE } from '@/test-utils/loadSampleData'
import { BalancesPresets } from './BalancesPresets'

globalThis.ResizeObserver ??= class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }

describe('BalancesPresets', () => {
  beforeEach(async () => {
    await seedStorage({ budget: SAMPLE.settings.budget })
    localStorage.clear()
    loadSampleData()
  })

  it('shows the Presets menu', () => {
    renderApp(<BalancesPresets />)
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument()
  })

  it('applies an old preset that carries a tax state without touching the tax state', async () => {
    localStorage.setItem('ledger:taxState', '"tx"')
    const debt = { id: 'd1', name: 'Card', balance: 1200, apr: 20, payment: 100, budgetRow: null }
    await seedStorage({ presets: { planningVariables: [{ name: 'Old', data: { taxState: 'ca', debts: [debt] } }] } })
    renderApp(<BalancesPresets />)
    await userEvent.click(screen.getByRole('button', { name: 'Presets' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Old' }))
    expect(JSON.parse(localStorage.getItem('ledger:debts') as string)[0].name).toBe('Card')
    expect(JSON.parse(localStorage.getItem('ledger:taxState') as string)).toBe('tx')
  })
})

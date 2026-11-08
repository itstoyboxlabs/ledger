import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { RetirementCalc } from './RetirementCalc'

const stored = (k: string) => JSON.parse(localStorage.getItem(`ledger:${k}`) as string)

describe('RetirementCalc', () => {
  beforeAll(() => {
    // radix tooltips measure with ResizeObserver, which jsdom lacks
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  })
  beforeEach(async () => {
    await seedStorage()
    localStorage.clear()
    loadSampleData()
  })

  it('renders the summary sentence and headline cards from the defaults', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByText(/You save until you retire, then take out \$60,000 a year/)).toBeInTheDocument()
    expect(screen.getByText(/Your 401k joins your\s+savings at 60/)).toBeInTheDocument()
    expect(screen.getByText('At retirement (60)')).toBeInTheDocument()
    expect(screen.getByText('Money lasts')).toBeInTheDocument()
    expect(screen.getByText('Left over at 70')).toBeInTheDocument()
  })

  it('shows the timeline fields with the default ages', () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(35)
    expect(screen.getByLabelText(/Retire at/)).toHaveValue(60)
    expect(screen.getByLabelText(/Plan to age/)).toHaveValue(95)
  })

  it('saves an edited age to localStorage and updates the projection', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    const plan = screen.getByLabelText(/Plan to age/)
    await userEvent.clear(plan)
    await userEvent.type(plan, '75')
    await waitFor(() => expect(stored('retireCalc').endAge).toBe(75))
    expect(screen.queryByText('Left over at 80')).toBeNull()
    expect(screen.getByText('Left over at 70')).toBeInTheDocument()
  })

  it('adds and removes an event', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add event' }))
    await waitFor(() => expect(stored('retireCalc').events).toHaveLength(1))
    expect(stored('retireCalc').events[0]).toMatchObject({ kind: 'out', age: 36, repeat: 'once' })
    await userEvent.click(screen.getByRole('button', { name: 'Remove event' }))
    await waitFor(() => expect(stored('retireCalc').events).toHaveLength(0))
  })

  it('Find reports when no retire age keeps the money from running out', async () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], withdrawMo: 1000000000 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    expect(await screen.findByText(/No retire age before/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Retire at/)).toHaveValue(60)
  })

  it('Find moves the retire age when a safe age exists', async () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], withdrawMo: 0, retireAge: 90 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Find' }))
    await waitFor(() => expect(stored('retireCalc').retireAge).toBe(36))
  })

  it('adds a fund row to the portfolio and persists it', async () => {
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    await userEvent.click(screen.getAllByRole('button', { name: '+ Add fund' })[0])
    await waitFor(() => expect(stored('retirePortfolio')).toHaveLength(2))
  })

  it('reads a saved plan from localStorage', () => {
    localStorage.setItem('ledger:retireCalc', JSON.stringify({ events: [], age: 50, retireAge: 65, withdrawMo: 3000 }))
    renderApp(<RetirementCalc debts={[]} goToBalances={() => {}} />)
    expect(screen.getByLabelText(/Current age/)).toHaveValue(50)
    expect(screen.getByText(/take out \$36,000 a year/)).toBeInTheDocument()
  })
})

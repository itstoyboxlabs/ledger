import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { VacationCalc } from './VacationCalc'

beforeEach(async () => {
  await seedStorage({ budget: { rows: [{ id: 'r1', name: 'Rent', amount: 1000 }] } })
  localStorage.clear()
})

describe('VacationCalc', () => {
  it('totals the default trip', async () => {
    renderApp(<VacationCalc />)
    // 4 nights x (200 + 75) + 300 + 50 + 100 + 100
    expect(await screen.findByText('$1,650.00')).toBeInTheDocument()
    expect(screen.getByText('3.3')).toBeInTheDocument()
  })
  it('per-night costs scale with nights', async () => {
    renderApp(<VacationCalc />)
    const nights = screen.getByLabelText('Nights')
    await userEvent.clear(nights)
    await userEvent.type(nights, '2')
    // 2 x 275 + 550
    expect(screen.getByText('$1,100.00')).toBeInTheDocument()
    expect(screen.getByText('2.2')).toBeInTheDocument()
  })
  it('shows a dash for months when nothing can be saved', async () => {
    renderApp(<VacationCalc />)
    const save = screen.getByLabelText(/You can save per month/)
    await userEvent.clear(save)
    await userEvent.type(save, '0')
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText('0.0')).toBeNull()
  })
  it('persists inputs', async () => {
    renderApp(<VacationCalc />)
    const flight = screen.getByLabelText(/Flights, round trip/)
    await userEvent.clear(flight)
    await userEvent.type(flight, '400')
    expect(JSON.parse(localStorage.getItem('ledger:vacationCalc') as string).flight).toBe(400)
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { FilingStatusCard } from './FilingStatusCard'

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.hasPointerCapture ??= () => false
})
beforeEach(() => localStorage.clear())

describe('FilingStatusCard', () => {
  it('defaults to Single and explains which pages use it', () => {
    renderApp(<FilingStatusCard />)
    expect(screen.getByRole('heading', { level: 2, name: 'Filing status' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filing status' })).toHaveTextContent('Single')
    expect(screen.getByText(/Take-home pay, Rent scenarios, the Hourly/)).toBeInTheDocument()
  })

  it('saves Married filing jointly', async () => {
    renderApp(<FilingStatusCard />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Filing status' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Married filing jointly' }))
    expect(JSON.parse(localStorage.getItem('ledger:filingStatus') ?? 'null')).toBe('mfj')
    expect(screen.getByText(/doubles the standard deduction to \$32,200/)).toBeInTheDocument()
  })

  it('reads a saved status', () => {
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    renderApp(<FilingStatusCard />)
    expect(screen.getByRole('combobox', { name: 'Filing status' })).toHaveTextContent('Married filing jointly')
  })
})

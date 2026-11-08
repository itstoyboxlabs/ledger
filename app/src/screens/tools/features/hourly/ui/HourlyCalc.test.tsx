import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { HourlyCalc } from './HourlyCalc'

beforeEach(() => localStorage.clear())

const row = (name: string): HTMLElement => screen.getByText(name).closest('tr') as HTMLElement

describe('HourlyCalc', () => {
  it('shows gross pay for 40 hours at $50', () => {
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    expect(within(row('Per week')).getByText('$2,000')).toBeInTheDocument()
    expect(within(row('Per year')).getByText('$104,000')).toBeInTheDocument()
    expect(within(row('Per month')).getByText('$8,667')).toBeInTheDocument()
  })
  it('after tax is less than before tax and tax is shown as a deduction', () => {
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    const cells = within(row('Per year')).getAllByRole('cell')
    expect(cells[2].textContent).toMatch(/^−\$/)
    const num = (t: string | null) => Number((t ?? '').replace(/[^0-9]/g, ''))
    expect(num(cells[3].textContent)).toBeLessThan(num(cells[1].textContent))
    expect(num(cells[3].textContent) + num(cells[2].textContent)).toBeGreaterThanOrEqual(104000 - 1)
  })
  it('says it assumes a W-2 employee, not freelance pay', () => {
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    expect(screen.getByText(/Assumes you are a W-2 employee/)).toBeInTheDocument()
    expect(screen.getByText(/Freelance or 1099 pay owes more/)).toBeInTheDocument()
  })
  it('recomputes when the rate changes', async () => {
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    const rate = screen.getByLabelText(/Pay \/ hour/)
    await userEvent.clear(rate)
    await userEvent.type(rate, '25')
    expect(within(row('Per week')).getByText('$1,000')).toBeInTheDocument()
  })
  it('zero hours gives zero everywhere', async () => {
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    const hours = screen.getByLabelText(/Hours \/ week/)
    await userEvent.clear(hours)
    await userEvent.type(hours, '0')
    expect(within(row('Per year')).getAllByText('$0').length).toBeGreaterThanOrEqual(2)
  })
  it('uses the shared tax state and links to About you', async () => {
    localStorage.setItem('ledger:taxState', JSON.stringify('ny'))
    const go = vi.fn()
    renderApp(<HourlyCalc goToAboutYou={go} />)
    expect(screen.getByText(/Taxed in New York/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(go).toHaveBeenCalled()
  })
  it('taxes a joint filer less and says so', () => {
    const single = renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    const singleTax = within(row('Per year')).getAllByRole('cell')[2].textContent
    expect(screen.getByText(/single filer, estimated/)).toBeInTheDocument()
    single.unmount()
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    renderApp(<HourlyCalc goToAboutYou={() => {}} />)
    expect(screen.getByText(/Using Married filing jointly from About you/)).toBeInTheDocument()
    expect(screen.getByText(/married filing jointly, estimated/)).toBeInTheDocument()
    const num = (t: string | null | undefined) => Number((t ?? '').replace(/[^0-9]/g, ''))
    expect(num(within(row('Per year')).getAllByRole('cell')[2].textContent)).toBeLessThan(num(singleTax))
  })
})

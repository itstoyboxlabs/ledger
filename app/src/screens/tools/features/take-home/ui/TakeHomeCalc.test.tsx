import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test-utils/renderApp'
import { TakeHomeCalc } from './TakeHomeCalc'

beforeEach(() => localStorage.clear())

const valueOf = (label: string): string =>
  (screen.getByText(label).closest('tr')?.querySelectorAll('td')[1].textContent ?? '')
const num = (t: string) => Number(t.replace(/[^0-9.]/g, ''))

describe('TakeHomeCalc', () => {
  it('breaks the default salary into deductions and take-home', () => {
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    expect(screen.getByText('Take-home pay')).toBeInTheDocument()
    expect(valueOf('Salary')).toBe('$80,000.00')
    expect(valueOf('401k (4%)')).toBe('−$3,200.00')
    expect(valueOf('Federal income tax')).toMatch(/^−\$/)
    const net = num(valueOf('Take-home per year'))
    expect(net).toBeGreaterThan(0)
    expect(net).toBeLessThan(80000)
  })
  it('month and paycheck are the yearly figure divided by 12 and 24', () => {
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    const year = num(valueOf('Take-home per year'))
    expect(num(valueOf('Take-home per month'))).toBeCloseTo(year / 12, 1)
    expect(num(valueOf('Per paycheck, paid twice a month'))).toBeCloseTo(year / 24, 1)
    expect(valueOf('Of every dollar you earn, you keep')).toMatch(/^\d+\.\d%$/)
  })
  it('a bigger salary raises take-home', async () => {
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    const before = num(valueOf('Take-home per year'))
    const salary = screen.getByLabelText(/Salary per year/)
    await userEvent.clear(salary)
    await userEvent.type(salary, '120000')
    expect(valueOf('Salary')).toBe('$120,000.00')
    expect(num(valueOf('Take-home per year'))).toBeGreaterThan(before)
  })
  it('zero salary keeps 0.0 percent without dividing by zero', async () => {
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    const salary = screen.getByLabelText(/Salary per year/)
    await userEvent.clear(salary)
    await userEvent.type(salary, '0')
    expect(valueOf('Of every dollar you earn, you keep')).toBe('0.0%')
  })
  it('adds and removes a deduction', async () => {
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    expect(screen.getAllByTitle('Remove')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: /Add something that comes out/ }))
    expect(screen.getAllByTitle('Remove')).toHaveLength(3)
    await userEvent.click(screen.getAllByTitle('Remove')[0])
    await userEvent.click(screen.getAllByTitle('Remove')[0])
    await userEvent.click(screen.getAllByTitle('Remove')[0])
    expect(screen.queryAllByTitle('Remove')).toHaveLength(0)
    expect(screen.queryByText('401k (4%)')).toBeNull()
  })
  it('shows the employer match for a 401k', () => {
    localStorage.setItem('ledger:takeHome', JSON.stringify({
      salary: 80000,
      deductions: [{ id: 'a', kind: '401k', unit: 'pct', amount: 5, match: 100 }],
    }))
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    expect(screen.getByText(/Employer match/)).toBeInTheDocument()
    expect(screen.getByText(/Your employer adds/).textContent).toContain('$4,000.00')
  })
  it('caps the 401k row at the yearly limit and matches only the capped amount', () => {
    localStorage.setItem('ledger:takeHome', JSON.stringify({
      salary: 500000,
      deductions: [{ id: 'a', kind: '401k', unit: 'pct', amount: 10, match: 50 }],
    }))
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    expect(valueOf('401k (10%), capped')).toBe('−$24,500.00')
    expect(screen.getByText(/Your employer adds/).textContent).toContain('$12,250.00')
  })
  it('names the tax state and links to Balances', async () => {
    localStorage.setItem('ledger:taxState', JSON.stringify('ca'))
    const go = vi.fn()
    renderApp(<TakeHomeCalc goToAboutYou={go} />)
    expect(screen.getByText(/Taxed in California/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(go).toHaveBeenCalled()
  })
  it('takes home more as a joint filer and shows where that comes from', () => {
    const single = renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    const singleNet = num(valueOf('Take-home per year'))
    expect(screen.queryByText(/Married filing jointly/)).not.toBeInTheDocument()
    single.unmount()
    localStorage.setItem('ledger:filingStatus', '"mfj"')
    renderApp(<TakeHomeCalc goToAboutYou={() => {}} />)
    expect(screen.getByText(/Using Married filing jointly from About you/)).toBeInTheDocument()
    expect(num(valueOf('Take-home per year'))).toBeGreaterThan(singleNet)
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { PayPlanCard } from './PayPlanCard'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'
import type { ResolvedPayPeriod } from '@/screens/retirement/types/ResolvedPayPeriod'

const period = (o: Partial<PayPeriod> = {}): PayPeriod => ({
  id: 'a', label: 'Now', fromAge: 35, toAge: 45, raisePct: 0,
  takeHomeFrom: 'today', takeHomePreset: '', k401: 3000, saveFrom: 'today', savePreset: '', savings: 5000, ...o,
})
const resolve = (p: PayPeriod, o: Partial<ResolvedPayPeriod> = {}): ResolvedPayPeriod => ({
  id: p.id,
  sim: {
    fromAge: p.fromAge, toAge: p.toAge, raisePct: p.raisePct,
    own: p.takeHomeFrom === 'typed' ? p.k401 : 3800, match: p.takeHomeFrom === 'typed' ? 0 : 1900, capOwn: p.takeHomeFrom !== 'typed',
    saving: p.saveFrom === 'typed' ? p.savings : 12000,
  },
  missingPay: false, missingSave: false, ...o,
})
const setup = (periods: PayPeriod[] = [], o: Partial<Parameters<typeof PayPlanCard>[0]> = {}) => {
  const onChange = vi.fn()
  const onAdd = vi.fn()
  render(
    <TooltipProvider>
      <PayPlanCard periods={periods} resolved={periods.map((p) => resolve(p))} issues={[]} todaySalary={95000} retireAge={60}
        takeHomePresets={[{ id: 'th1', name: 'Easier job', k401: 0 }]}
        budgetPresets={[{ id: 'b1', name: 'Frugal' }]}
        onChange={onChange} onAdd={onAdd} {...o} />
    </TooltipProvider>,
  )
  return { onChange, onAdd }
}

describe('PayPlanCard', () => {
  beforeAll(() => {
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  })

  it('shows today\'s row, the hint and the footer when there is no plan', async () => {
    const { onAdd } = setup([], { today: <p>Today row</p>, footer: <p>Own savings here</p> })
    expect(screen.getByRole('heading', { level: 2, name: 'Pay and saving over time' })).toBeInTheDocument()
    expect(screen.getByText('Today row')).toBeInTheDocument()
    expect(screen.getByText('Own savings here')).toBeInTheDocument()
    expect(screen.getByText('Same pay until you retire. $95,000 a year from Take-home pay.')).toBeInTheDocument()
    expect(screen.getByText(/If your pay might change, like a raise or a lower paying job at a certain age, add another period\./)).toBeInTheDocument()
    expect(screen.getByText(/Save each as a preset, then\s+pick those presets here\./)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Plan pay changes' }))
    expect(onAdd).toHaveBeenCalled()
  })

  it('a period shows its ages, 401k, savings and raise, and no pay', () => {
    setup([period(), period({ id: 'b', label: '', fromAge: 45, toAge: 'retire' })])
    expect(screen.getByLabelText(/From age for Now/)).toHaveValue(35)
    expect(screen.getByLabelText(/Until age for Now/)).toHaveValue(45)
    expect(screen.queryByLabelText(/Until age for period 2/)).toBeNull()
    expect(screen.getAllByText('$5,700')).toHaveLength(2)
    expect(screen.getAllByText('$12,000')).toHaveLength(2)
    expect(screen.getByLabelText(/Contributions grow a year for Now/)).toHaveValue(0)
    expect(screen.queryByText(/Pay per year/)).toBeNull()
    expect(screen.queryByText(/For how many years/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Auto' })).toBeNull()
    expect(screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Budget preset for Now: Today's Budget" })).toBeInTheDocument()
  })

  it('sets the end by an until age and the next from age cannot start before it', async () => {
    const { onChange } = setup([period(), period({ id: 'b', label: '', fromAge: 45, toAge: 'retire' })])
    const until = screen.getByLabelText(/Until age for Now/)
    await userEvent.clear(until)
    await userEvent.type(until, '50')
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ toAge: 50 }), expect.objectContaining({ fromAge: 45 })])
    const from2 = screen.getByLabelText(/From age for period 2/)
    await userEvent.clear(from2)
    await userEvent.type(from2, '40')
    await userEvent.tab()
    // the box snaps back up to where Now ends
    expect(from2).toHaveValue(45)
  })

  it('points the 401k at a Take-home preset and copies its amount as the fallback', async () => {
    const { onChange } = setup([period()])
    await userEvent.click(screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" }))
    expect(await screen.findByText('Take-home preset')).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Easier job' }))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ takeHomeFrom: 'preset', takeHomePreset: 'th1', k401: 0 })])
  })

  it('switching to typed starts from what the period showed', async () => {
    const { onChange } = setup([period()])
    await userEvent.click(screen.getByRole('button', { name: "Budget preset for Now: Today's Budget" }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Type it in' }))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ saveFrom: 'typed', savings: 12000 })])
  })

  it('typed values show dollar inputs', () => {
    setup([period({ takeHomeFrom: 'typed', saveFrom: 'typed' })])
    expect(screen.getByLabelText(/Into 401k per year for Now/)).toHaveValue(3000)
    expect(screen.getByLabelText(/Into savings per year for Now/)).toHaveValue(5000)
  })

  it('a deleted preset shows the typed value and its note', () => {
    const p = period({ takeHomeFrom: 'preset', takeHomePreset: 'gone' })
    render(
      <TooltipProvider>
        <PayPlanCard periods={[p]} resolved={[resolve({ ...p, takeHomeFrom: 'typed' }, { missingPay: true })]} retireAge={60} todaySalary={95000}
          issues={[{ id: 'a', tone: 'warn', text: 'Its Take-home preset was deleted, so it uses the typed 401k.' }]}
          takeHomePresets={[]} budgetPresets={[]} onChange={() => {}} onAdd={() => {}} />
      </TooltipProvider>,
    )
    expect(screen.getByLabelText(/Into 401k per year for Now/)).toHaveValue(3000)
    expect(screen.getByRole('button', { name: 'Take-home preset for Now: Typed' })).toBeInTheDocument()
    expect(screen.getByText('Its Take-home preset was deleted, so it uses the typed 401k.')).toBeInTheDocument()
  })

  it('removes a period and shows plan notes and the footer', async () => {
    const { onChange } = setup([period()], {
      issues: [{ id: null, tone: 'warn', text: 'No period covers age 50.' }],
      footer: <p>Own savings here</p>,
    })
    expect(screen.getByText('No period covers age 50.')).toBeInTheDocument()
    expect(screen.getByText('Own savings here')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Now' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('Back to one period sits in the header once there is more than one period', async () => {
    const { onChange } = setup([period(), period({ id: 'b', label: '', fromAge: 45, toAge: 'retire' })])
    await userEvent.click(screen.getByRole('button', { name: 'Back to one period' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('has no Back to one period with a single period', () => {
    setup([period()])
    expect(screen.queryByRole('button', { name: 'Back to one period' })).toBeNull()
    expect(screen.queryByText('Go back to the same pay')).toBeNull()
  })
})

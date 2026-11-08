import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { PayPlanCard } from './PayPlanCard'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

const period = (o: Partial<PayPeriod> = {}): PayPeriod => ({
  id: 'a', label: 'Now', fromAge: 35, toAge: 45, salary: 90000, raisePct: 0, k401: 'auto', savings: 'auto', ...o,
})
const setup = (o: Partial<Parameters<typeof PayPlanCard>[0]> = {}) => {
  const onChange = vi.fn()
  const onAdd = vi.fn()
  render(
    <TooltipProvider>
      <PayPlanCard periods={[]} issues={[]} todaySalary={95000} retireAge={60} default401kPct={4}
        preview={() => ({ k401: 3600, savings: 12000 })} onChange={onChange} onAdd={onAdd} {...o} />
    </TooltipProvider>,
  )
  return { onChange, onAdd }
}

describe('PayPlanCard', () => {
  it('says today\'s pay holds when there is no plan', async () => {
    const { onAdd } = setup()
    expect(screen.getByRole('heading', { level: 2, name: 'Your pay over time' })).toBeInTheDocument()
    expect(screen.getByText('Same pay until you retire. $95,000 a year from Take-home pay.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Plan pay changes' }))
    expect(onAdd).toHaveBeenCalled()
  })

  it('shows each period with labelled fields and the Auto amounts', () => {
    setup({ periods: [period(), period({ id: 'b', label: '', fromAge: 45, toAge: 'retire' })] })
    expect(screen.getByLabelText(/From age for Now/)).toHaveValue(35)
    expect(screen.getByLabelText(/Until age for Now/)).toHaveValue(45)
    expect(screen.getByLabelText(/For how many years for Now/)).toHaveValue(10)
    expect(screen.getByLabelText(/Pay per year for period 2/)).toHaveValue(90000)
    expect(screen.queryByLabelText(/Until age for period 2/)).toBeNull()
    expect(screen.getAllByText('$3,600')).toHaveLength(2)
    expect(screen.getAllByText('$12,000')).toHaveLength(2)
  })

  it('sets the end by a number of years', async () => {
    const { onChange } = setup({ periods: [period()] })
    const years = screen.getByLabelText(/For how many years for Now/)
    await userEvent.clear(years)
    await userEvent.type(years, '5')
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ toAge: 40 })])
  })

  it('types a 401k percent and a savings amount when Auto is turned off', async () => {
    const { onChange } = setup({ periods: [period()] })
    const autos = screen.getAllByRole('button', { name: 'Auto' })
    await userEvent.click(autos[0])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ k401: 4 })])
    await userEvent.click(autos[1])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ savings: 12000 })])
  })

  it('removes a period and shows its notes', async () => {
    const { onChange } = setup({
      periods: [period()],
      issues: [{ id: 'a', tone: 'warn', text: 'Overlaps period 2.' }, { id: null, tone: 'warn', text: 'No period covers age 50.' }],
    })
    expect(screen.getByText('Overlaps period 2.')).toBeInTheDocument()
    expect(screen.getByText('No period covers age 50.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Now' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('hides savings for a period that starts after you retire, since its pay covers what you take out', () => {
    setup({ periods: [period({ fromAge: 60, toAge: 65 })] })
    expect(screen.getByLabelText(/Pay per year for Now/)).toBeInTheDocument()
    expect(screen.queryByText(/Into savings per year/)).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { TodayPayRow } from './TodayPayRow'

const setup = (o: { autoSavings?: boolean } = {}) => {
  const fns = { onPickPay: vi.fn(), onToggleAuto: vi.fn(), on401k: vi.fn(), onSave: vi.fn(), onAuto: vi.fn(), onPickPreset: vi.fn(), onRaise: vi.fn() }
  render(
    <TooltipProvider>
      <TodayPayRow
        takeHomePresets={[{ id: 'th1', name: 'Easier job' }]}
        budgetPresets={[{ id: 'b1', name: 'Frugal' }]}
        onPickPay={fns.onPickPay}
        k401={{ auto: true, autoValue: 3200, autoTip: 'From Take-home.', value: 5000, onToggleAuto: fns.onToggleAuto, onChange: fns.on401k }}
        raise={{ value: 0, onChange: fns.onRaise }}
        savings={{ auto: o.autoSavings ?? true, autoValue: 33142, autoTip: 'From the Budget.', value: 20000, onChange: fns.onSave, onAuto: fns.onAuto, onPickPreset: fns.onPickPreset }}
      />
    </TooltipProvider>,
  )
  return fns
}

describe('TodayPayRow', () => {
  beforeAll(() => {
    globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
  })

  it('shows today\'s 401k and savings, with no pay and no Auto badge', () => {
    setup()
    expect(screen.queryByText(/Pay per year/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Auto' })).toBeNull()
    expect(screen.getByText('$3,200')).toBeInTheDocument()
    expect(screen.getByText('$33,142')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Budget preset for Now: Today's Budget" })).toBeInTheDocument()
  })

  it('a Take-home preset on the 401k badge starts a plan', async () => {
    const { onPickPay } = setup()
    await userEvent.click(screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Easier job' }))
    expect(onPickPay).toHaveBeenCalledWith('th1')
  })

  it('the saving badge switches between Auto and typed, or picks a Budget preset', async () => {
    const { onAuto, onPickPreset } = setup()
    await userEvent.click(screen.getByRole('button', { name: "Budget preset for Now: Today's Budget" }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Type it in' }))
    expect(onAuto).toHaveBeenCalledWith(false)
    await userEvent.click(screen.getByRole('button', { name: "Budget preset for Now: Today's Budget" }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Frugal' }))
    expect(onPickPreset).toHaveBeenCalledWith('b1')
  })

  it('typed savings show an input', () => {
    setup({ autoSavings: false })
    expect(screen.getByLabelText(/Into savings per year/)).toHaveValue(20000)
    expect(screen.getByRole('button', { name: 'Budget preset for Now: Typed' })).toBeInTheDocument()
  })
  it('the 401k picks today\'s Take-home or typed dollars', async () => {
    const { onToggleAuto, onPickPay } = setup()
    await userEvent.click(screen.getByRole('button', { name: "Take-home preset for Now: Today's Take-home" }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Type it in' }))
    expect(onToggleAuto).toHaveBeenCalledTimes(1)
    expect(onPickPay).not.toHaveBeenCalled()
  })

  it('has the same Contributions grow a year field as the plan periods', async () => {
    const { onRaise } = setup()
    const raise = screen.getByLabelText(/Contributions grow a year/)
    expect(raise).toHaveValue(0)
    await userEvent.clear(raise)
    await userEvent.type(raise, '3')
    expect(onRaise).toHaveBeenLastCalledWith(3)
  })
})

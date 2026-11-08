import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { RetirementView } from './RetirementView'

import type { Debt } from '@/shared/types/Debt'

const calc = vi.fn((_props: { debts: Debt[]; goToBalances?: () => void }) => <div>calc stub</div>)
vi.mock('@/screens/retirement/ui/RetirementCalc', () => ({
  RetirementCalc: (props: { debts: Debt[]; goToBalances?: () => void }) => calc(props),
}))

describe('RetirementView', () => {
  beforeEach(() => { localStorage.clear(); calc.mockClear() })

  it('renders the calculator', () => {
    renderApp(<RetirementView goToBalances={() => {}} />)
    expect(screen.getByText('calc stub')).toBeInTheDocument()
  })
  it('passes stored debts and goToBalances down', () => {
    localStorage.setItem('ledger:debts', JSON.stringify([{ id: 'd1', name: 'Card', balance: 500 }]))
    const goToBalances = vi.fn()
    renderApp(<RetirementView goToBalances={goToBalances} />)
    const props = calc.mock.calls[0]![0]
    expect(props.goToBalances).toBe(goToBalances)
    expect(props.debts.some((d: Debt) => d.balance === 500)).toBe(true)
  })
  it('passes an empty debt list when none are stored', () => {
    renderApp(<RetirementView goToBalances={() => {}} />)
    expect(calc.mock.calls[0]![0].debts).toEqual([])
  })
})

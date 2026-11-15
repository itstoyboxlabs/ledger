import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'
import { seedStorage } from '@/test-utils/seedStorage'
import { useChosenBudget } from './useChosenBudget'

function Probe({ id }: { id: string }) {
  const { budget, options } = useChosenBudget(id)
  return (
    <div>
      <span>rows {budget ? budget.rows.map((r) => r.name).join(',') : 'loading'}</span>
      <span>options {options.map((o) => o.label).join(',')}</span>
    </div>
  )
}

beforeEach(async () => {
  localStorage.clear()
  await seedStorage({
    budget: { rows: [{ id: 'r1', name: 'Rent', amount: 2000 }] },
    presets: { expenses: [{ id: 'p1', name: 'Lean', data: { rows: [{ id: 'q1', name: 'Gym', amount: 50 }] } }] },
  })
})

describe('useChosenBudget', () => {
  it("uses today's Budget when no id is given", async () => {
    renderApp(<Probe id="" />)
    expect(await screen.findByText('rows Rent')).toBeInTheDocument()
  })
  it('uses a saved Budget when its id is given', async () => {
    renderApp(<Probe id="p1" />)
    expect(await screen.findByText('rows Gym')).toBeInTheDocument()
  })
  it("lists today's Budget and the saved ones", async () => {
    renderApp(<Probe id="" />)
    expect(await screen.findByText("options Today's Budget,Lean")).toBeInTheDocument()
  })
})

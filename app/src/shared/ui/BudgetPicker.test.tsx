import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetPicker } from './BudgetPicker'

const OPTIONS = [
  { value: 'today', label: "Today's Budget" },
  { value: 'p1', label: 'Lean' },
]

describe('BudgetPicker', () => {
  it("shows today's Budget when nothing is picked", () => {
    render(<BudgetPicker value="" onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByText("Today's Budget")).toBeInTheDocument()
    expect(screen.getByText('Which Budget')).toBeInTheDocument()
  })
  it('shows the saved Budget that is picked', () => {
    render(<BudgetPicker value="p1" onChange={() => {}} options={OPTIONS} />)
    expect(screen.getByText('Lean')).toBeInTheDocument()
  })
  it("reports '' for today's Budget and the id for a saved one", async () => {
    const onChange = vi.fn()
    render(<BudgetPicker value="" onChange={onChange} options={OPTIONS} />)
    await userEvent.click(screen.getByText("Today's Budget"))
    await userEvent.click(await screen.findByText('Lean'))
    expect(onChange).toHaveBeenCalledWith('p1')
  })
})

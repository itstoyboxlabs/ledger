import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogEntryAmount } from './LogEntryAmount'

describe('LogEntryAmount', () => {
  it('shows the amount', () => {
    render(<LogEntryAmount value={12.5} onChange={() => {}} label="lunch" />)
    expect(screen.getByRole('button', { name: 'Change amount: lunch' })).toHaveTextContent('$12.50')
  })
  it('saves a new amount on Enter', async () => {
    const onChange = vi.fn()
    render(<LogEntryAmount value={12.5} onChange={onChange} label="lunch" />)
    await userEvent.click(screen.getByRole('button', { name: 'Change amount: lunch' }))
    await userEvent.keyboard('20{Enter}')
    expect(onChange).toHaveBeenCalledWith(20)
  })
  it('adds up a sum', async () => {
    const onChange = vi.fn()
    render(<LogEntryAmount value={1} onChange={onChange} label="x" />)
    await userEvent.click(screen.getByRole('button', { name: 'Change amount: x' }))
    await userEvent.keyboard('12 + 4.5{Enter}')
    expect(onChange).toHaveBeenCalledWith(16.5)
  })
  it('keeps the old amount on Escape', async () => {
    const onChange = vi.fn()
    render(<LogEntryAmount value={5} onChange={onChange} label="x" />)
    await userEvent.click(screen.getByRole('button', { name: 'Change amount: x' }))
    await userEvent.keyboard('99{Escape}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Change amount: x' })).toBeInTheDocument()
  })
  it('does not save when nothing changed or the box is empty', async () => {
    const onChange = vi.fn()
    render(<LogEntryAmount value={5} onChange={onChange} label="x" />)
    await userEvent.click(screen.getByRole('button', { name: 'Change amount: x' }))
    await userEvent.keyboard('{Enter}')
    await userEvent.click(screen.getByRole('button', { name: 'Change amount: x' }))
    await userEvent.clear(screen.getByLabelText('Amount: x'))
    await userEvent.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })
})

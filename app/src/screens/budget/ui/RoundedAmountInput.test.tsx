import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundedAmountInput } from './RoundedAmountInput'

describe('RoundedAmountInput', () => {
  it('shows the value rounded up to whole dollars', () => {
    render(<RoundedAmountInput label="Coffee amount per month" value={12.2} onCommit={() => {}} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(13)
  })
  it('is named by its label prop', () => {
    render(<RoundedAmountInput label="Coffee amount per month" value={5} onCommit={() => {}} />)
    expect(screen.getByRole('spinbutton', { name: 'Coffee amount per month' })).toBeInTheDocument()
  })
  it('reveals the exact stored value on focus', async () => {
    render(<RoundedAmountInput label="Coffee amount per month" value={12.4} onCommit={() => {}} />)
    await userEvent.click(screen.getByRole('spinbutton'))
    expect(screen.getByRole('spinbutton')).toHaveValue(12.4)
  })
  it('does not commit when focused and left without typing', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput label="Coffee amount per month" value={12.4} onCommit={onCommit} />)
    await userEvent.click(screen.getByRole('spinbutton'))
    await userEvent.tab()
    expect(onCommit).not.toHaveBeenCalled()
    expect(screen.getByRole('spinbutton')).toHaveValue(13)
  })
  it('does not commit when the same value is typed again', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput label="Coffee amount per month" value={12.4} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '12.40')
    await userEvent.tab()
    expect(onCommit).not.toHaveBeenCalled()
  })
  it('commits exactly what was typed on blur', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput label="Coffee amount per month" value={10} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '45.1')
    await userEvent.tab()
    expect(onCommit).toHaveBeenCalledWith(45.1)
  })
  it('commits 0 when the field is emptied', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput label="Coffee amount per month" value={10} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.tab()
    expect(onCommit).toHaveBeenCalledWith(0)
  })
})

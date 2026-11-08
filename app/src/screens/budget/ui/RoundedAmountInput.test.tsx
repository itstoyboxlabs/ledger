import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundedAmountInput } from './RoundedAmountInput'

describe('RoundedAmountInput', () => {
  it('shows the value rounded up to whole dollars', () => {
    render(<RoundedAmountInput value={12.2} onCommit={() => {}} />)
    expect(screen.getByRole('spinbutton')).toHaveValue(13)
  })
  it('commits the ceiling of what was typed on blur', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput value={10} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '45.1')
    await userEvent.tab()
    expect(onCommit).toHaveBeenCalledWith(46)
  })
  it('commits 0 when the field is emptied', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput value={10} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.tab()
    expect(onCommit).toHaveBeenCalledWith(0)
  })
  it('rounds up negative values toward zero', async () => {
    const onCommit = vi.fn()
    render(<RoundedAmountInput value={0} onCommit={onCommit} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '-2.5')
    await userEvent.tab()
    expect(onCommit).toHaveBeenCalledWith(-2)
  })
})

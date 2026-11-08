import { useState, type ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DraftNumberInput } from './DraftNumberInput'

type HarnessProps = Partial<ComponentProps<typeof DraftNumberInput>> & { initial?: number }

function Harness(props: HarnessProps) {
  const [v, setV] = useState(props.initial ?? 5)
  return <DraftNumberInput {...props} value={v} onChange={(n) => { setV(n); props.onChange?.(n) }} />
}

describe('DraftNumberInput', () => {
  it('uses ariaLabel as the accessible name', () => {
    render(<Harness ariaLabel="Allocation" boxed />)
    expect(screen.getByRole('spinbutton', { name: 'Allocation' })).toBeInTheDocument()
  })
  it('shows the value', () => {
    render(<Harness />)
    expect(screen.getByRole('spinbutton')).toHaveValue(5)
  })

  it('lets the field be cleared without forcing 0, and commits typed numbers', async () => {
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    expect(input).toHaveValue(null)
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.type(input, '42')
    expect(onChange).toHaveBeenLastCalledWith(42)
  })

  it('shows the last committed value after blurring an empty field', async () => {
    render(<Harness initial={7} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.tab()
    expect(input).toHaveValue(7)
  })

  it('boxed: shows suffix and steppers that respect max', async () => {
    const onChange = vi.fn()
    render(<Harness boxed suffix="%" initial={9} max={10} step={5} onChange={onChange} />)
    expect(screen.getByText('%')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenLastCalledWith(10)
  })

  it('boxed: snaps an out-of-range typed value back on blur', async () => {
    const onChange = vi.fn()
    render(<Harness boxed initial={1} min={0} max={10} onChange={onChange} />)
    const input = screen.getByRole('spinbutton')
    await userEvent.clear(input)
    await userEvent.type(input, '50')
    await userEvent.tab()
    expect(onChange).toHaveBeenLastCalledWith(10)
    expect(input).toHaveValue(10)
  })
})

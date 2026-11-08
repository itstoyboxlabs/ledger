import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('increases by the step', async () => {
    const onChange = vi.fn()
    render(<Stepper value={10} step={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(15)
  })

  it('decreases by the step', async () => {
    const onChange = vi.fn()
    render(<Stepper value={10} step={5} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('defaults to a step of 1 and avoids float drift', async () => {
    const onChange = vi.fn()
    render(<Stepper value={0.1} step={0.2} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(0.3)
  })

  it('goes below zero', async () => {
    const onChange = vi.fn()
    render(<Stepper value={0} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(-1)
  })
})

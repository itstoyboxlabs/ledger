import { act, fireEvent, render, screen } from '@testing-library/react'
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

  describe('holding a chevron', () => {
    afterEach(() => vi.useRealTimers())

    it('steps once on press, then keeps stepping until released', () => {
      vi.useFakeTimers()
      const onChange = vi.fn()
      const { rerender } = render(<Stepper value={10} step={1} onChange={onChange} />)
      const up = screen.getByLabelText('Increase')
      fireEvent.pointerDown(up, { button: 0 })
      expect(onChange).toHaveBeenCalledTimes(1)
      // a held press keeps going once the delay passes, reading the newest value each time
      act(() => vi.advanceTimersByTime(400))
      rerender(<Stepper value={11} step={1} onChange={onChange} />)
      act(() => vi.advanceTimersByTime(70))
      expect(onChange).toHaveBeenLastCalledWith(12)
      act(() => vi.advanceTimersByTime(210))
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(5)
      fireEvent.pointerUp(up)
      const calls = onChange.mock.calls.length
      act(() => vi.advanceTimersByTime(1000))
      expect(onChange).toHaveBeenCalledTimes(calls)
    })

    it('stops when the pointer leaves or the component goes away', () => {
      vi.useFakeTimers()
      const onChange = vi.fn()
      const { unmount } = render(<Stepper value={0} onChange={onChange} />)
      const down = screen.getByLabelText('Decrease')
      fireEvent.pointerDown(down, { button: 0 })
      fireEvent.pointerLeave(down)
      act(() => vi.advanceTimersByTime(1000))
      expect(onChange).toHaveBeenCalledTimes(1)
      fireEvent.pointerDown(down, { button: 0 })
      unmount()
      act(() => vi.advanceTimersByTime(1000))
      expect(onChange).toHaveBeenCalledTimes(2)
    })

    it('a keyboard click steps once and a mouse click does not step twice', async () => {
      const onChange = vi.fn()
      render(<Stepper value={5} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Increase'))
      expect(onChange).toHaveBeenCalledTimes(1)
      onChange.mockClear()
      await userEvent.click(screen.getByLabelText('Increase'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })
})

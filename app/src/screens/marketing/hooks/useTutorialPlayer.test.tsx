import { render, screen, fireEvent } from '@testing-library/react'
import { useTutorialPlayer } from '@/screens/marketing/hooks/useTutorialPlayer'

function Probe() {
  const { index, select, onEnded, videoRef } = useTutorialPlayer(3)
  return (
    <div>
      <span data-testid="i">{index}</span>
      <video ref={videoRef} data-testid="v" />
      <button onClick={() => select(2)}>pick</button>
      <button onClick={onEnded}>ended</button>
    </div>
  )
}

describe('useTutorialPlayer', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/tutorial')
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
  })

  it('starts on chapter 1', () => {
    render(<Probe />)
    expect(screen.getByTestId('i')).toHaveTextContent('0')
    expect(window.location.hash).toBe('#chapter-1')
  })

  it('opens the chapter named in the hash, kept in range', () => {
    window.history.replaceState(null, '', '/tutorial#chapter-9')
    render(<Probe />)
    expect(screen.getByTestId('i')).toHaveTextContent('2')
  })

  it('plays a chapter when it is picked and updates the hash', () => {
    render(<Probe />)
    fireEvent.click(screen.getByText('pick'))
    expect(screen.getByTestId('i')).toHaveTextContent('2')
    expect(window.location.hash).toBe('#chapter-3')
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled()
  })

  it('moves to the next chapter when one ends, and stops at the last', () => {
    render(<Probe />)
    fireEvent.click(screen.getByText('ended'))
    expect(screen.getByTestId('i')).toHaveTextContent('1')
    fireEvent.click(screen.getByText('pick'))
    fireEvent.click(screen.getByText('ended'))
    expect(screen.getByTestId('i')).toHaveTextContent('2')
  })
})

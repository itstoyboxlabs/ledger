import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialPage } from '@/screens/marketing/ui/TutorialPage'

describe('TutorialPage', () => {
  beforeEach(() => window.history.replaceState(null, '', '/tutorial'))

  it('lists all nine chapters and starts on the first', () => {
    render(<TutorialPage />)
    expect(screen.getAllByText(/^Chapter \d$/)).toHaveLength(9)
    expect(screen.getByText('Chapter 1 of 9')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn Ledger in 24 minutes.')
  })

  it('switches chapter when one is picked', () => {
    window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
    render(<TutorialPage />)
    fireEvent.click(screen.getByText('Retirement').closest('button')!)
    expect(screen.getByText('Chapter 9 of 9')).toBeInTheDocument()
  })
})

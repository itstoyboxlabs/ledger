import { render, screen } from '@testing-library/react'
import { NextStatementBadge } from './NextStatementBadge'
import { loadSampleData } from '@/test-utils/loadSampleData'

beforeEach(() => loadSampleData())

describe('NextStatementBadge', () => {
  it('shows the closing day with an ordinal', () => {
    render(<NextStatementBadge account="chk" />)
    expect(screen.getByText(/\d+(st|nd|rd|th)$/)).toBeInTheDocument()
  })

  it('flags the drifted cycle (month ends vary) with ~ and an explanation', () => {
    const { container } = render(<NextStatementBadge account="chk" />)
    expect(container.firstChild).toHaveTextContent('~31st')
    expect((container.firstChild as HTMLElement).getAttribute('title')).toMatch(/varied across statements.*31st/)
  })

  it('renders nothing for an account with no statements', () => {
    const { container } = render(<NextStatementBadge account="nope" />)
    expect(container).toBeEmptyDOMElement()
  })
})

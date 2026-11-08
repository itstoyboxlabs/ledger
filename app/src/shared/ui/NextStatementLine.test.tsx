import { render, screen } from '@testing-library/react'
import { NextStatementLine } from './NextStatementLine'
import { loadSampleData } from '@/test-utils/loadSampleData'

beforeEach(() => loadSampleData())

describe('NextStatementLine', () => {
  it('shows the sub line with the closing day', () => {
    render(<NextStatementLine account="cc" />)
    expect(screen.getByText(/statement closes/)).toHaveTextContent(/\d+(st|nd|rd|th)/)
  })

  it('renders nothing without history', () => {
    const { container } = render(<NextStatementLine account="nope" />)
    expect(container).toBeEmptyDOMElement()
  })
})

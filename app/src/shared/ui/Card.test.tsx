import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children and merges className', () => {
    render(<Card className="extra" data-testid="c">Hello</Card>)
    const el = screen.getByTestId('c')
    expect(el).toHaveTextContent('Hello')
    expect(el).toHaveClass('card', 'extra')
  })
})

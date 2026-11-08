import { render, screen } from '@testing-library/react'
import { EventPair } from './EventPair'

describe('EventPair', () => {
  it('shows the label above its fields', () => {
    render(<EventPair label="Windfall"><input aria-label="amount" /><input aria-label="age" /></EventPair>)
    expect(screen.getByText('Windfall')).toBeInTheDocument()
    expect(screen.getByLabelText('amount')).toBeInTheDocument()
    expect(screen.getByLabelText('age')).toBeInTheDocument()
  })
})

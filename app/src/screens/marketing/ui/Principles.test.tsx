import { render, screen } from '@testing-library/react'
import { Principles } from '@/screens/marketing/ui/Principles'

describe('Principles', () => {
  it('shows three numbered statements', () => {
    render(<Principles />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Free without limits.' })).toBeInTheDocument()
  })
})

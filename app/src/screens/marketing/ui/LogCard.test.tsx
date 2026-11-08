import { render, screen } from '@testing-library/react'
import { LogCard } from '@/screens/marketing/ui/LogCard'

describe('LogCard', () => {
  it('shows the meters and the latest entries', () => {
    render(<LogCard />)
    expect(screen.getByText('Restaurants')).toBeInTheDocument()
    expect(screen.getByText('Nov 7 · Bread · Groceries')).toBeInTheDocument()
  })
})

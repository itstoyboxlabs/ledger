import { render, screen } from '@testing-library/react'
import { CategoryTable } from '@/screens/marketing/ui/CategoryTable'

describe('CategoryTable', () => {
  it('shows amount and share for each category', () => {
    render(<CategoryTable categories={[{ name: 'Housing', amount: 50, color: '#111' }]} total={200} />)
    expect(screen.getByText('Housing')).toBeInTheDocument()
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()
  })
})

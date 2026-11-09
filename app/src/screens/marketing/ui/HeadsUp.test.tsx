import { render, screen } from '@testing-library/react'
import { HeadsUp } from '@/screens/marketing/ui/HeadsUp'

describe('HeadsUp', () => {
  it('explains that an assistant reads the statements and nothing is uploaded', () => {
    render(<HeadsUp />)
    expect(screen.getByRole('complementary', { name: 'A heads up on how it works' })).toBeInTheDocument()
    expect(screen.getByText(/nothing you give it is ever uploaded/)).toBeInTheDocument()
    expect(screen.getByText(/AI assistant reads them/)).toBeInTheDocument()
    expect(screen.getByText('Happy planning!')).toBeInTheDocument()
  })
})

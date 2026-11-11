import { render, screen } from '@testing-library/react'
import { RetirementProjection } from '@/screens/marketing/ui/RetirementProjection'

describe('RetirementProjection', () => {
  it('shows the projected balance', () => {
    render(<RetirementProjection />)
    expect(screen.getByText('Projected balance at 55')).toBeInTheDocument()
    expect(screen.getByText('$2,755,828')).toBeInTheDocument()
  })
})

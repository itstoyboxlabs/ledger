import { render, screen } from '@testing-library/react'
import { HowStep } from '@/screens/marketing/ui/HowStep'
import { HOW_STEPS } from '@/screens/marketing/constants/HOW_STEPS'

describe('HowStep', () => {
  it('shows the number, title and text', () => {
    render(<HowStep number={2} step={HOW_STEPS[1]} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Use the import prompt' })).toBeInTheDocument()
  })
})

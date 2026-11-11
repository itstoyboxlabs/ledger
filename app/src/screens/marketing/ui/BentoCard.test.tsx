import { render, screen } from '@testing-library/react'
import { BentoCard } from '@/screens/marketing/ui/BentoCard'

describe('BentoCard', () => {
  it('shows the title, text and sample', () => {
    render(
      <BentoCard content={{ title: 'Tools', text: 'Calculators.' }}>
        <i>sample</i>
      </BentoCard>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByText('Calculators.')).toBeInTheDocument()
    expect(screen.getByText('sample')).toBeInTheDocument()
  })
})

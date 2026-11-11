import { render, screen } from '@testing-library/react'
import { FeatureCard } from '@/screens/marketing/ui/FeatureCard'
import { FEATURE_CARDS } from '@/screens/marketing/constants/FEATURE_CARDS'

describe('FeatureCard', () => {
  it('shows the eyebrow, headline, text and the sample screen', () => {
    render(
      <FeatureCard card={FEATURE_CARDS[1]}>
        <div>sample</div>
      </FeatureCard>,
    )
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Plan what you can afford.' })).toBeInTheDocument()
    expect(screen.getByText('sample')).toBeInTheDocument()
  })
  it('flips the sides on request', () => {
    const { container } = render(<FeatureCard card={FEATURE_CARDS[0]} flip />)
    expect(container.querySelector('article')).toHaveClass('flip')
    expect(container.querySelector('article')).toHaveAttribute('data-card', 'spending')
  })
})

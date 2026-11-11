import { render, screen } from '@testing-library/react'
import { FeatureShowcase } from '@/screens/marketing/ui/FeatureShowcase'

describe('FeatureShowcase', () => {
  it('stacks five cards and flips every second one', () => {
    const { container } = render(<FeatureShowcase />)
    const cards = container.querySelectorAll('article.fcard')
    expect(cards).toHaveLength(5)
    expect(cards[0]).not.toHaveClass('flip')
    expect(cards[1]).toHaveClass('flip')
    expect(screen.getByRole('heading', { level: 3, name: 'See the years ahead.' })).toBeInTheDocument()
  })
  it('keeps the features anchor for the nav', () => {
    const { container } = render(<FeatureShowcase />)
    expect(container.querySelector('#features')).not.toBeNull()
  })
})

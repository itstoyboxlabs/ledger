import { render } from '@testing-library/react'
import { FeaturesSection } from '@/screens/marketing/ui/FeaturesSection'

describe('FeaturesSection', () => {
  it('shows one active panel for the chosen tab', () => {
    const { container } = render(<FeaturesSection tab="balances" onSelect={() => {}} />)
    expect(container.querySelectorAll('.panel')).toHaveLength(6)
    expect(container.querySelector('.panel.on')).toHaveAttribute('data-p', 'balances')
  })
})

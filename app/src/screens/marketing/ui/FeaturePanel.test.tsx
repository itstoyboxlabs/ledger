import { render, screen } from '@testing-library/react'
import { FeaturePanel } from '@/screens/marketing/ui/FeaturePanel'
import { FEATURE_PANELS } from '@/screens/marketing/constants/FEATURE_PANELS'

describe('FeaturePanel', () => {
  it('shows the text and the card, and is shown only when active', () => {
    const { container, rerender } = render(<FeaturePanel panel={FEATURE_PANELS[1]} active={false}><div>card</div></FeaturePanel>)
    expect(screen.getByText('Plan what you can afford.')).toBeInTheDocument()
    expect(screen.getByText('card')).toBeInTheDocument()
    expect(container.firstChild).not.toHaveClass('on')
    rerender(<FeaturePanel panel={FEATURE_PANELS[1]} active><div>card</div></FeaturePanel>)
    expect(container.firstChild).toHaveClass('on')
  })
})

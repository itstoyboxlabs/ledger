import { render, screen } from '@testing-library/react'
import { PreviewTabs } from '@/screens/marketing/ui/PreviewTabs'

describe('PreviewTabs', () => {
  it('marks only the first label', () => {
    render(<PreviewTabs items={['A', 'B']} className="tabs" />)
    expect(screen.getByText('A')).toHaveClass('on')
    expect(screen.getByText('B')).not.toHaveClass('on')
  })
})

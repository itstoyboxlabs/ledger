import { render, screen } from '@testing-library/react'
import { FaqSection } from '@/screens/marketing/ui/FaqSection'

describe('FaqSection', () => {
  it('has six questions with answers', () => {
    const { container } = render(<FaqSection />)
    expect(container.querySelectorAll('details')).toHaveLength(6)
    expect(screen.getByText('Does it cost anything?')).toBeInTheDocument()
  })
})

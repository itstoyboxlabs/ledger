import { render, screen } from '@testing-library/react'
import { SkipLink } from '@/screens/marketing/ui/SkipLink'

describe('SkipLink', () => {
  it('links to the main content', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
  })
})

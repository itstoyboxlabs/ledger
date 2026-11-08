import { render, screen } from '@testing-library/react'
import { SkipLink } from '@/shared/ui/SkipLink'

describe('SkipLink', () => {
  it('is a link to the main content', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
  })
})

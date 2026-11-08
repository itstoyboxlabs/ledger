import { render, screen } from '@testing-library/react'
import { PrivacyStrip } from '@/screens/marketing/ui/PrivacyStrip'

describe('PrivacyStrip', () => {
  it('has the privacy and open source promises', () => {
    render(<PrivacyStrip />)
    expect(screen.getByRole('heading', { name: 'Private by design' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Free and open source' })).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { PrivacyStrip } from '@/screens/marketing/ui/PrivacyStrip'

describe('PrivacyStrip', () => {
  it('has the no bank logins and open source promises', () => {
    render(<PrivacyStrip />)
    expect(screen.getByRole('heading', { name: 'No bank logins' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Free and open source' })).toBeInTheDocument()
  })
})

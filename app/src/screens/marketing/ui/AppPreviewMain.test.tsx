import { render, screen } from '@testing-library/react'
import { AppPreviewMain } from '@/screens/marketing/ui/AppPreviewMain'

describe('AppPreviewMain', () => {
  it('shows the three numbers and the category table', () => {
    render(<AppPreviewMain />)
    expect(screen.getByText('$7,821.04')).toBeInTheDocument()
    expect(screen.getByText('Subscriptions & Software')).toBeInTheDocument()
    expect(screen.getByText('YTD')).toBeInTheDocument()
  })
})

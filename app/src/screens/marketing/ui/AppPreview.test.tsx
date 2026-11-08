import { render, screen } from '@testing-library/react'
import { AppPreview } from '@/screens/marketing/ui/AppPreview'

describe('AppPreview', () => {
  it('is labelled as a picture of the Spending page', () => {
    render(<AppPreview />)
    expect(screen.getByLabelText("Ledger's Spending page")).toBeInTheDocument()
  })
})

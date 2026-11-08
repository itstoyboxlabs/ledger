import { render, screen } from '@testing-library/react'
import { AppPreviewSidebar } from '@/screens/marketing/ui/AppPreviewSidebar'

describe('AppPreviewSidebar', () => {
  it('lists the six pages and the accounts', () => {
    render(<AppPreviewSidebar />)
    for (const name of ['Spending', 'Budget', 'Log', 'Tools', 'Balances', 'Retirement', 'Total Checking', 'Harbor Savings']) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })
})

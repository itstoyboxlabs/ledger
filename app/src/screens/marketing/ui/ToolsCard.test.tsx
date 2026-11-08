import { render, screen } from '@testing-library/react'
import { ToolsCard } from '@/screens/marketing/ui/ToolsCard'

describe('ToolsCard', () => {
  it('walks from salary to take-home', () => {
    render(<ToolsCard />)
    expect(screen.getByText('$150,000')).toBeInTheDocument()
    expect(screen.getByText('Take-home per month')).toBeInTheDocument()
    expect(screen.getByText('62.2%')).toBeInTheDocument()
  })
})

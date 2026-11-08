import { render, screen, fireEvent } from '@testing-library/react'
import { PlanSection } from '@/screens/marketing/ui/PlanSection'

describe('PlanSection', () => {
  it('shows the projection and opens Retirement from the button', () => {
    const onExplore = vi.fn()
    render(<PlanSection onExplore={onExplore} />)
    expect(screen.getByText('$2,755,828')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Explore Retirement' }))
    expect(onExplore).toHaveBeenCalled()
  })
})

import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureTabs } from '@/screens/marketing/ui/FeatureTabs'

describe('FeatureTabs', () => {
  it('has six tabs, selects one and reports clicks', () => {
    const onSelect = vi.fn()
    render(<FeatureTabs tab="log" onSelect={onSelect} />)
    expect(screen.getAllByRole('tab')).toHaveLength(6)
    expect(screen.getByRole('tab', { name: 'Log' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Tools' }))
    expect(onSelect).toHaveBeenCalledWith('tools')
  })
})

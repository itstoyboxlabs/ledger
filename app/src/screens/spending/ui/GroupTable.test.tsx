import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { loadSampleData } from '@/test-utils/loadSampleData'
import { renderApp } from '@/test-utils/renderApp'
import { GroupTable } from '@/screens/spending/ui/GroupTable'

const groups = [
  { name: 'Housing', total: 1850, count: 1, color: '#111' },
  { name: 'Food & Dining', total: 150, count: 5, color: '#222' },
]

describe('GroupTable', () => {
  beforeEach(() => loadSampleData())

  it('renders a row per group with total and percent', () => {
    renderApp(<GroupTable groups={groups} total={2000} onSelect={() => {}} />)
    const row = screen.getByText('Housing').closest('tr')
    expect(within(row as HTMLElement).getByText('$1,850.00')).toBeInTheDocument()
    expect(within(row as HTMLElement).getByText('92.5%')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
  })
  it('uses a custom heading', () => {
    renderApp(<GroupTable groups={groups} total={2000} heading="Merchant" />)
    expect(screen.getByRole('columnheader', { name: 'Merchant' })).toBeInTheDocument()
  })
  it('shows a dash when the total is zero', () => {
    renderApp(<GroupTable groups={[{ name: 'X', total: 0, count: 0, color: '#000' }]} total={0} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
  it('calls onSelect only when drillable', async () => {
    const onSelect = vi.fn()
    const { unmount } = renderApp(<GroupTable groups={groups} total={2000} onSelect={onSelect} />)
    await userEvent.click(screen.getByText('Housing'))
    expect(onSelect).not.toHaveBeenCalled()
    unmount()
    renderApp(<GroupTable groups={groups} total={2000} onSelect={onSelect} drillable />)
    await userEvent.click(screen.getByText('Housing'))
    expect(onSelect).toHaveBeenCalledWith('Housing')
  })
})

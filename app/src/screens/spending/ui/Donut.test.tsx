import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'

vi.mock('recharts', async (orig) => {
  const mod = await orig<typeof import('recharts')>()
  const React = await import('react')
  return { ...mod, ResponsiveContainer: ({ children }: { children: React.ReactElement<{ width: number; height: number }> }) => React.cloneElement(children, { width: 500, height: 300 }) }
})
import { Donut } from '@/screens/spending/ui/Donut'

describe('Donut', () => {
  const groups = [
    { name: 'Housing', total: 1850, color: '#111', count: 1 },
    { name: 'Empty', total: 0, color: '#222', count: 0 },
  ]
  it('shows the center label and total', () => {
    renderApp(<Donut groups={groups} total={1850} centerLabel="May 2026" />)
    expect(screen.getByText('May 2026')).toBeInTheDocument()
    expect(screen.getByText('$1,850.00')).toBeInTheDocument()
  })
  it('renders with no groups', () => {
    renderApp(<Donut groups={[]} total={0} centerLabel="None" />)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
})

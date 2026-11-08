import { screen } from '@testing-library/react'
import { renderApp } from '@/test-utils/renderApp'

vi.mock('recharts', async (orig) => {
  const mod = await orig<typeof import('recharts')>()
  const React = await import('react')
  return {
    ...mod,
    ResponsiveContainer: ({ children }: { children: React.ReactElement<{ width: number; height: number }> }) => React.cloneElement(children, { width: 600, height: 300 }),
  }
})
import { TrendsChart } from '@/screens/spending/ui/TrendsChart'

const monthly = [
  { m: '2026-05', income: 3000, spending: 2000, net: 1000, Housing: 1500, Other: 500 },
  { m: '2026-06', income: 3000, spending: 2500, net: 500, Housing: 1500, Other: 1000 },
]

describe('TrendsChart', () => {
  it('draws month ticks and dollar ticks', () => {
    const { container } = renderApp(<TrendsChart monthly={monthly} cats={['Housing', 'Other']} onPick={() => {}} />)
    expect(container.querySelector('.recharts-wrapper')).toBeTruthy()
    expect(screen.getByText('May')).toBeInTheDocument()
    expect(screen.getByText('Jun')).toBeInTheDocument()
  })
  it('renders one bar series per category', () => {
    const { container } = renderApp(<TrendsChart monthly={monthly} cats={['Housing', 'Other']} onPick={() => {}} />)
    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(2)
  })
})

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
import { CashFlowChart } from '@/screens/spending/ui/CashFlowChart'

const monthly = [
  { m: '2026-05', income: 3000, spending: 2000, net: 1000, Housing: 1500, Other: 500 },
  { m: '2026-06', income: 3000, spending: 2500, net: 500, Housing: 1500, Other: 1000 },
]

describe('CashFlowChart', () => {
  it('draws month ticks, income and spending bars and a net line', () => {
    const { container } = renderApp(<CashFlowChart monthly={monthly} onPick={() => {}} />)
    expect(screen.getByText('May')).toBeInTheDocument()
    expect(container.querySelectorAll('.recharts-bar')).toHaveLength(2)
    expect(container.querySelector('.recharts-line')).toBeTruthy()
  })
})

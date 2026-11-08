import { barChartLayout } from '@/screens/marketing/utils/barChartLayout'

describe('barChartLayout', () => {
  const months = [{ label: 'Jun', value: 4000 }, { label: 'Jul', value: 8000 }]
  const { grid, bars } = barChartLayout(months)

  it('draws five grid lines from $0K to $8K', () => {
    expect(grid.map((g) => g.label)).toEqual(['$0K', '$2K', '$4K', '$6K', '$8K'])
    expect(grid[0].y).toBe(170)
    expect(grid[4].y).toBe(10)
  })

  it('scales bar heights to the $8K ceiling', () => {
    expect(bars[0].height).toBe(80)
    expect(bars[1].height).toBe(160)
    expect(bars[1].y).toBe(10)
  })

  it('spaces bars evenly and marks the last one', () => {
    expect(bars[0].x).toBe(62)
    expect(bars[1].x).toBe(138)
    expect(bars.map((b) => b.last)).toEqual([false, true])
  })
})

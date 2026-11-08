import type { BarChartLayout } from '@/screens/marketing/types/BarChartLayout'
import type { BarGridLine } from '@/screens/marketing/types/BarGridLine'
import type { BarShape } from '@/screens/marketing/types/BarShape'
import type { BarMonth } from '@/screens/marketing/types/BarMonth'

const HEIGHT = 160
const TOP = 10
const WIDTH = 46
const MAX = 8000

// Geometry for the monthly spending bars (a 440 x 210 drawing): grid lines every $2K and one bar per month.
export function barChartLayout(months: BarMonth[]): BarChartLayout {
  const grid: BarGridLine[] = []
  for (let v = 0; v <= MAX; v += 2000) grid.push({ y: TOP + HEIGHT - (v / MAX) * HEIGHT, label: `$${v / 1000}K` })
  const bars = months.map(({ label, value }, i): BarShape => {
    const x = 62 + i * 76
    const height = (value / MAX) * HEIGHT
    return { label, x, y: TOP + HEIGHT - height, width: WIDTH, height, labelX: x + WIDTH / 2, labelY: TOP + HEIGHT + 18, last: i === months.length - 1 }
  })
  return { grid, bars }
}

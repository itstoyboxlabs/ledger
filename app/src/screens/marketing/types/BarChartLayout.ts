import type { BarGridLine } from '@/screens/marketing/types/BarGridLine'
import type { BarShape } from '@/screens/marketing/types/BarShape'

export interface BarChartLayout {
  grid: BarGridLine[]
  bars: BarShape[]
}

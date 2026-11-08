import { Sector } from 'recharts'
import type { PieSectorDataItem } from 'recharts/types/polar/Pie'

/* ---------- donut ---------- */

export function renderActiveShape(props: PieSectorDataItem) {
  return (
    <g>
      <Sector {...props} outerRadius={(props.outerRadius ?? 0) + 6} />
    </g>
  )
}

import type { DemoCategory } from '@/screens/marketing/types/DemoCategory'
import type { DonutSegment } from '@/screens/marketing/types/DonutSegment'
const START = 25 // start at 12 o'clock on a circle with a circumference of 100

// One ring segment per category. A circle with r = 15.9155 has a circumference of 100,
// so the dash length is the share in percent. Each segment leaves a small gap.
export function donutSegments(categories: DemoCategory[], total: number): DonutSegment[] {
  let offset = START
  return categories.map(({ name, amount, color }) => {
    const share = (amount / total) * 100
    const dash = Math.max(share - 0.6, 0.2)
    const segment: DonutSegment = { name, color, dashArray: `${dash} ${100 - dash}`, dashOffset: offset }
    offset -= share
    return segment
  })
}

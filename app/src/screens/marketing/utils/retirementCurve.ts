import { smoothPath } from '@/screens/marketing/utils/smoothPath'
import type { RetirementPoint } from '@/screens/marketing/types/RetirementPoint'
import type { RetirementCurveGeometry } from '@/screens/marketing/types/RetirementCurveGeometry'
import type { ChartPoint } from '@/screens/marketing/types/ChartPoint'

const WIDTH = 500
const LEFT = 14
const BASE = 185
const HEIGHT = 125
const MAX = 3400000
const FIRST_AGE = 34
const AGE_SPAN = 26

// Geometry for the "projected balance" curve (a 520 x 215 drawing). `markAge` gets the dot and the label.
export function retirementCurve(points: RetirementPoint[], markAge: number, markValue: number): RetirementCurveGeometry {
  const px = (age: number) => LEFT + ((age - FIRST_AGE) / AGE_SPAN) * (WIDTH - LEFT)
  const py = (value: number) => BASE - (value / MAX) * HEIGHT
  const pts = points.map(({ age, value }): ChartPoint => [px(age), py(value)])
  const line = smoothPath(pts)
  return {
    line,
    area: `${line} L${pts[pts.length - 1][0]},${BASE} L${pts[0][0]},${BASE}Z`,
    left: LEFT,
    right: WIDTH,
    base: BASE,
    mark: { x: px(markAge), y: py(markValue) },
    ticks: [35, 40, 45, 50, 55, 60].map((age) => ({ age, x: px(age) })),
  }
}

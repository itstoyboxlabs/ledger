export interface RetirementCurveGeometry {
  line: string
  area: string
  left: number
  right: number
  base: number
  mark: { x: number; y: number }
  ticks: { age: number; x: number }[]
}

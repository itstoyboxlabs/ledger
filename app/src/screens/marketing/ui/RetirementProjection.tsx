import { RetirementCurve } from '@/screens/marketing/ui/RetirementCurve'
import { RETIREMENT_POINTS } from '@/screens/marketing/constants/RETIREMENT_POINTS'

// The projected balance at the retirement age, with its growth curve.
export function RetirementProjection() {
  return (
    <div className="card proj">
      <small>Projected balance at 55</small>
      <div className="big">$2,755,828</div>
      <RetirementCurve points={RETIREMENT_POINTS} markAge={54} markValue={2755828} markLabel="Retire at 55" markValueLabel="$2.76M" />
    </div>
  )
}

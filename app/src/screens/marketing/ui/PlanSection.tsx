import { Icon } from '@/screens/marketing/ui/Icon'
import { RetirementCurve } from '@/screens/marketing/ui/RetirementCurve'
import { RETIREMENT_POINTS } from '@/screens/marketing/constants/RETIREMENT_POINTS'
import type { CSSProperties } from 'react'

type PlanSectionProps = { onExplore: () => void }

// "Explore Retirement" jumps to the features and opens the Retirement tab.
export function PlanSection({ onExplore }: PlanSectionProps) {
  return (
    <section className="plan">
      <div className="reveal">
        <h2>
          <Icon paths={['M3 21h18M6 17V11M10 17V7M14 17v-4M18 17V5']} />
          Plan for the long term.
        </h2>
        <p>Project when you could retire, see how your savings grow over time and test different plans based on your real numbers.</p>
        <a className="btn btn-o" href="#features" onClick={onExplore}>
          Explore Retirement
        </a>
      </div>
      <div className="card proj reveal" style={{ '--d': '.15s' } as CSSProperties}>
        <small>Projected balance at 55</small>
        <div className="big">$2,755,828</div>
        <RetirementCurve points={RETIREMENT_POINTS} markAge={54} markValue={2755828} markLabel="Retire at 55" markValueLabel="$2.76M" />
      </div>
    </section>
  )
}

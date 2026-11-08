import { Icon } from '@/screens/marketing/ui/Icon'
import type { HowStepContent } from '@/screens/marketing/types/HowStepContent'

type HowStepProps = { number: number; step: HowStepContent }

export function HowStep({ number, step }: HowStepProps) {
  return (
    <div className="step">
      <div className="num">{number}</div>
      <Icon paths={step.paths} />
      <h3>{step.title}</h3>
      <p>{step.text}</p>
    </div>
  )
}

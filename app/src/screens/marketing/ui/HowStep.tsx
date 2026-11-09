import type { HowStepContent } from '@/screens/marketing/types/HowStepContent'

type HowStepProps = { number: number; step: HowStepContent }

export function HowStep({ number, step }: HowStepProps) {
  return (
    <div className="step">
      <div className="num">{number}</div>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
    </div>
  )
}

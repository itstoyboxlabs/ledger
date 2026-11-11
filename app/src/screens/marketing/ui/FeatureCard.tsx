import type { FeatureCardContent } from '@/screens/marketing/types/FeatureCardContent'
import type { ReactNode } from 'react'

type FeatureCardProps = { card: FeatureCardContent; flip?: boolean; children?: ReactNode }

// One big tinted card: the words on one side and the sample screen (the children) on the other. `flip` swaps the sides.
export function FeatureCard({ card, flip = false, children }: FeatureCardProps) {
  return (
    <article className={flip ? 'fcard flip reveal' : 'fcard reveal'} data-card={card.id}>
      <div className="fcard-text">
        <span className="eyebrow">{card.eyebrow}</span>
        <h3>{card.title}</h3>
        <p>{card.text}</p>
      </div>
      <div className="fcard-ui">{children}</div>
    </article>
  )
}

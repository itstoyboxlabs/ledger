import { BalancesCard } from '@/screens/marketing/ui/BalancesCard'
import { BudgetCard } from '@/screens/marketing/ui/BudgetCard'
import { FeatureCard } from '@/screens/marketing/ui/FeatureCard'
import { LogCard } from '@/screens/marketing/ui/LogCard'
import { RetirementCard } from '@/screens/marketing/ui/RetirementCard'
import { RetirementProjection } from '@/screens/marketing/ui/RetirementProjection'
import { SpendingCard } from '@/screens/marketing/ui/SpendingCard'
import { FEATURE_CARDS } from '@/screens/marketing/constants/FEATURE_CARDS'
import type { FeatureCardId } from '@/screens/marketing/types/FeatureCardId'
import type { ReactElement } from 'react'

const SCREENS: Record<FeatureCardId, () => ReactElement> = {
  spending: SpendingCard,
  budget: BudgetCard,
  log: LogCard,
  balances: BalancesCard,
  retirement: () => (
    <>
      <RetirementProjection />
      <RetirementCard />
    </>
  ),
}

// The five main screens as full width cards, sides alternating.
export function FeatureShowcase() {
  return (
    <section id="features" className="showcase">
      <div className="center reveal">
        <h2>Everything in one plan.</h2>
        <p>Five screens that share the same numbers.</p>
      </div>
      {FEATURE_CARDS.map((card, i) => {
        const Screen = SCREENS[card.id]
        return (
          <FeatureCard key={card.id} card={card} flip={i % 2 === 1}>
            <Screen />
          </FeatureCard>
        )
      })}
    </section>
  )
}

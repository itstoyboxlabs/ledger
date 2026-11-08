import { BalancesCard } from '@/screens/marketing/ui/BalancesCard'
import { BudgetCard } from '@/screens/marketing/ui/BudgetCard'
import { FeaturePanel } from '@/screens/marketing/ui/FeaturePanel'
import { FeatureTabs } from '@/screens/marketing/ui/FeatureTabs'
import { LogCard } from '@/screens/marketing/ui/LogCard'
import { RetirementCard } from '@/screens/marketing/ui/RetirementCard'
import { SpendingCard } from '@/screens/marketing/ui/SpendingCard'
import { ToolsCard } from '@/screens/marketing/ui/ToolsCard'
import { FEATURE_PANELS } from '@/screens/marketing/constants/FEATURE_PANELS'
import type { FeatureTabId } from '@/screens/marketing/types/FeatureTabId'
import type { ReactElement } from 'react'

const CARDS: Record<FeatureTabId, () => ReactElement> = {
  spending: SpendingCard,
  budget: BudgetCard,
  log: LogCard,
  tools: ToolsCard,
  balances: BalancesCard,
  retirement: RetirementCard,
}

type FeaturesSectionProps = { tab: FeatureTabId; onSelect: (id: FeatureTabId) => void }

// The six tabs. The selected tab lives in the landing page because the "Explore Retirement" button also sets it.
export function FeaturesSection({ tab, onSelect }: FeaturesSectionProps) {
  return (
    <section id="features">
      <FeatureTabs tab={tab} onSelect={onSelect} />
      {FEATURE_PANELS.map((panel, i) => {
        const Card = CARDS[panel.id]
        return (
          <FeaturePanel key={panel.id} panel={panel} active={panel.id === tab} first={i === 0}>
            <Card />
          </FeaturePanel>
        )
      })}
    </section>
  )
}

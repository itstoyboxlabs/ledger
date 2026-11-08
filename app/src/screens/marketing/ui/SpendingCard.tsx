import { PreviewTabs } from '@/screens/marketing/ui/PreviewTabs'
import { SpendingBars } from '@/screens/marketing/ui/SpendingBars'
import { SubscriptionsFound } from '@/screens/marketing/ui/SubscriptionsFound'
import { SPENDING_MONTHS } from '@/screens/marketing/constants/SPENDING_MONTHS'
import { SPENDING_VIEWS } from '@/screens/marketing/constants/SPENDING_VIEWS'
import { SUBSCRIPTIONS_FOUND } from '@/screens/marketing/constants/SUBSCRIPTIONS_FOUND'

export function SpendingCard() {
  return (
    <div className="card">
      <PreviewTabs items={SPENDING_VIEWS} className="mini-tabs" />
      <div className="bars">
        <SpendingBars months={SPENDING_MONTHS} />
        <div className="stat">
          <small>Oct 2026</small>
          <div className="big">$6,405</div>
          <div className="row">
            <span>vs Sep</span>
            <span className="up">+1.4%</span>
          </div>
          <div className="row">
            <span>Net</span>
            <span className="down">+$1,416</span>
          </div>
          <div className="row">
            <span>Subscriptions</span>
            <span style={{ color: '#dde2ee' }}>$116/mo</span>
          </div>
        </div>
      </div>
      <SubscriptionsFound items={SUBSCRIPTIONS_FOUND} />
    </div>
  )
}

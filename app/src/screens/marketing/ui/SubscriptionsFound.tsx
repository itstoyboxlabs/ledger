import type { SubscriptionFound } from '@/screens/marketing/types/SubscriptionFound'

type SubscriptionsFoundProps = { items: SubscriptionFound[] }

export function SubscriptionsFound({ items }: SubscriptionsFoundProps) {
  return (
    <div className="subs" style={{ margin: '18px 0 0' }}>
      <div className="subs-h">
        <span>Subscriptions found</span>
        <b>7 monthly · $116 a month · $1,391 a year</b>
      </div>
      <div className="subs-l">
        {items.map((s) => (
          <span key={s.name}>
            {s.name} <b>{s.price}</b>
          </span>
        ))}
      </div>
      <div className="subs-f">Each one shows the day it bills and the card it&apos;s on. Drop one from your budget and it stays gone until it charges again.</div>
    </div>
  )
}

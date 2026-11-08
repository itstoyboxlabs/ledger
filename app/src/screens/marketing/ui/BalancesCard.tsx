import { KeyValueRow } from '@/screens/marketing/ui/KeyValueRow'
import { OWED_ROWS } from '@/screens/marketing/constants/OWED_ROWS'
import { OWNED_ROWS } from '@/screens/marketing/constants/OWNED_ROWS'

export function BalancesCard() {
  return (
    <div className="card">
      <div className="grid2" style={{ marginBottom: 14 }}>
        <div className="mk">
          <small>Total owed</small>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>$56,000</div>
        </div>
        <div className="mk">
          <small>Total owned</small>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--good)' }}>$87,496</div>
        </div>
      </div>
      <div className="lbl">What you owe</div>
      {OWED_ROWS.map((r) => (
        <KeyValueRow key={r.label} label={r.label} amount={r.amount} tone="neg" />
      ))}
      <div className="lbl" style={{ marginTop: 14 }}>
        What you have
      </div>
      {OWNED_ROWS.map((r) => (
        <KeyValueRow key={r.label} label={r.label} amount={r.amount} />
      ))}
    </div>
  )
}

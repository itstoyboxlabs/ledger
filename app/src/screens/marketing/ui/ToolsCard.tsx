import { KeyValueRow } from '@/screens/marketing/ui/KeyValueRow'
import { TAKE_HOME_ROWS } from '@/screens/marketing/constants/TAKE_HOME_ROWS'

export function ToolsCard() {
  return (
    <div className="card">
      <div className="lbl">Take-home pay · $150,000 salary · taxed in New York (NYC)</div>
      {TAKE_HOME_ROWS.map((r) => (
        <KeyValueRow key={r.label} label={r.label} amount={r.amount} tone={r.tone} />
      ))}
      <div className="kv b">
        <span style={{ color: '#fff' }}>Take-home per month</span>
        <span className="pos">$7,774</span>
      </div>
      <div className="kv b">
        <span style={{ color: '#fff' }}>Of every dollar you earn, you keep</span>
        <span className="pos">62.2%</span>
      </div>
    </div>
  )
}

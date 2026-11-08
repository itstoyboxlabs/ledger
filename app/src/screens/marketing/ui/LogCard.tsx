import { KeyValueRow } from '@/screens/marketing/ui/KeyValueRow'
import { LogMeter } from '@/screens/marketing/ui/LogMeter'
import { LOG_ENTRIES } from '@/screens/marketing/constants/LOG_ENTRIES'
import { LOG_METERS } from '@/screens/marketing/constants/LOG_METERS'

export function LogCard() {
  return (
    <div className="card">
      <div className="lbl">Nov 2026 so far · $147.70 across 4 entries</div>
      <div className="grid2">
        {LOG_METERS.map((m) => (
          <LogMeter key={m.name} meter={m} />
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        {LOG_ENTRIES.map((e) => (
          <KeyValueRow key={e.label} label={e.label} amount={e.amount} />
        ))}
      </div>
    </div>
  )
}

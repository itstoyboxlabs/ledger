import { FEATURE_PANELS } from '@/screens/marketing/constants/FEATURE_PANELS'
import type { FeatureTabId } from '@/screens/marketing/types/FeatureTabId'

type FeatureTabsProps = { tab: FeatureTabId; onSelect: (id: FeatureTabId) => void }

export function FeatureTabs({ tab, onSelect }: FeatureTabsProps) {
  return (
    <div className="ftabs reveal" role="tablist">
      {FEATURE_PANELS.map((p) => (
        <button key={p.id} type="button" role="tab" aria-selected={p.id === tab} aria-controls={`panel-${p.id}`} className={p.id === tab ? 'on' : undefined} onClick={() => onSelect(p.id)}>
          {p.label}
        </button>
      ))}
    </div>
  )
}

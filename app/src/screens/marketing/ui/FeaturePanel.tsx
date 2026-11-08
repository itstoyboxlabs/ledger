import { CheckList } from '@/screens/marketing/ui/CheckList'
import type { FeaturePanelContent } from '@/screens/marketing/types/FeaturePanelContent'
import type { ReactNode } from 'react'

type FeaturePanelProps = {
  panel: FeaturePanelContent
  active: boolean
  first?: boolean
  children?: ReactNode
}

// One tab's text on the left and its sample card (the children) on the right.
export function FeaturePanel({ panel, active, first = false, children }: FeaturePanelProps) {
  const cls = ['panel', active ? 'on' : '', first ? 'reveal-kids' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} data-p={panel.id} role="tabpanel" id={`panel-${panel.id}`}>
      <div>
        <h3>{panel.title}</h3>
        <p>{panel.text}</p>
        <CheckList items={panel.checks} />
      </div>
      {children}
    </div>
  )
}

import type { CheckItem } from '@/screens/marketing/types/CheckItem'
import type { FeatureTabId } from '@/screens/marketing/types/FeatureTabId'

export interface FeaturePanelContent {
  id: FeatureTabId
  label: string
  title: string
  text: string
  checks: CheckItem[]
}

import type { FeatureCardId } from '@/screens/marketing/types/FeatureCardId'

// One big feature card: the screen's name, a headline and a short paragraph.
export interface FeatureCardContent {
  id: FeatureCardId
  eyebrow: string
  title: string
  text: string
}

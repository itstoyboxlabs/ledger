import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'

// The path each prerendered page is served at.
export const PAGE_PATHS: Record<MarketingRoute, string> = {
  home: '/',
  tutorial: '/tutorial',
}

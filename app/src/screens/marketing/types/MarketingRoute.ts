import type { AppRoute } from '@/shared/enums/AppRoute'

// The pages that are prerendered: everything except the app itself.
export type MarketingRoute = Exclude<AppRoute, 'app'>

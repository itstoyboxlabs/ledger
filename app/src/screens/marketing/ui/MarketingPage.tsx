import { LandingPage } from '@/screens/marketing/ui/LandingPage'
import { TutorialPage } from '@/screens/marketing/ui/TutorialPage'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'

type MarketingPageProps = { route: MarketingRoute }

// The public pages. `route` is 'home' or 'tutorial' (see routeFor).
export function MarketingPage({ route }: MarketingPageProps) {
  return route === 'tutorial' ? <TutorialPage /> : <LandingPage />
}

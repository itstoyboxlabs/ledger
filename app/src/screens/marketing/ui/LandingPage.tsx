import { useState } from 'react'
import { FaqSection } from '@/screens/marketing/ui/FaqSection'
import { FeaturesSection } from '@/screens/marketing/ui/FeaturesSection'
import { FinalCta } from '@/screens/marketing/ui/FinalCta'
import { HeadsUp } from '@/screens/marketing/ui/HeadsUp'
import { Hero } from '@/screens/marketing/ui/Hero'
import { HowSection } from '@/screens/marketing/ui/HowSection'
import { IconSprite } from '@/screens/marketing/ui/IconSprite'
import { MarketingNav } from '@/screens/marketing/ui/MarketingNav'
import { PlanSection } from '@/screens/marketing/ui/PlanSection'
import { SkipLink } from '@/screens/marketing/ui/SkipLink'
import { PrivacyStrip } from '@/screens/marketing/ui/PrivacyStrip'
import { useScrollReveal } from '@/screens/marketing/hooks/useScrollReveal'
import type { FeatureTabId } from '@/screens/marketing/types/FeatureTabId'

export function LandingPage() {
  const [tab, setTab] = useState<FeatureTabId>('spending')
  useScrollReveal()
  return (
    <>
      <SkipLink />
      <div className="glow-top"></div>
      <IconSprite />
      <div className="wrap">
        <MarketingNav />
      </div>
      <main id="main">
        <div className="wrap">
          <Hero />
          <HeadsUp />
          <HowSection />
          <FeaturesSection tab={tab} onSelect={setTab} />
          <PrivacyStrip />
          <PlanSection onExplore={() => setTab('retirement')} />
          <FaqSection />
        </div>
        <FinalCta />
      </main>
    </>
  )
}

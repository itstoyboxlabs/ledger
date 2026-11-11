import { BentoGrid } from '@/screens/marketing/ui/BentoGrid'
import { FaqSection } from '@/screens/marketing/ui/FaqSection'
import { FeatureShowcase } from '@/screens/marketing/ui/FeatureShowcase'
import { FinalCta } from '@/screens/marketing/ui/FinalCta'
import { Hero } from '@/screens/marketing/ui/Hero'
import { HowSection } from '@/screens/marketing/ui/HowSection'
import { IconSprite } from '@/screens/marketing/ui/IconSprite'
import { MarketingNav } from '@/screens/marketing/ui/MarketingNav'
import { Principles } from '@/screens/marketing/ui/Principles'
import { SkipLink } from '@/screens/marketing/ui/SkipLink'
import { Statement } from '@/screens/marketing/ui/Statement'
import { useScrollReveal } from '@/screens/marketing/hooks/useScrollReveal'

export function LandingPage() {
  useScrollReveal()
  return (
    <>
      <SkipLink />
      <div className="glow-top"></div>
      <IconSprite />
      <div className="nav-bar">
        <div className="wrap">
          <MarketingNav />
        </div>
      </div>
      <main id="main" className="land">
        <div className="wrap">
          <Hero />
          <Statement />
          <Principles />
          <HowSection />
          <FeatureShowcase />
          <BentoGrid />
          <FaqSection />
        </div>
        <FinalCta />
      </main>
    </>
  )
}

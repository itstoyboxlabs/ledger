import { AppPreview } from '@/screens/marketing/ui/AppPreview'
import { HeroCopy } from '@/screens/marketing/ui/HeroCopy'
import { LINKS } from '@/screens/marketing/constants/LINKS'

// The headline on top and Ledger's Spending page at full width below, fading into the page.
export function Hero() {
  return (
    <section className="hero">
      <HeroCopy />
      <div className="hero-shot">
        <AppPreview />
        <a className="btn btn-g demo" href={LINKS.app}>
          Open the demo
        </a>
      </div>
    </section>
  )
}

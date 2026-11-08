import { FinalWave } from '@/screens/marketing/ui/FinalWave'
import { Icon } from '@/screens/marketing/ui/Icon'
import { MarketingFooter } from '@/screens/marketing/ui/MarketingFooter'
import { LINKS } from '@/screens/marketing/constants/LINKS'

export function FinalCta() {
  return (
    <section className="final">
      <div className="wrap reveal-kids">
        <h2>Take control of your money.</h2>
        <p>Private, powerful and free. Just your data, your plan and your goals.</p>
        <div className="ctas">
          <a className="btn btn-g" href={LINKS.app}>
            Try Ledger
          </a>
          <a className="btn btn-o" href={LINKS.repo}>
            <Icon name="github" />
            View on GitHub
          </a>
        </div>
      </div>
      <FinalWave />
      <MarketingFooter />
    </section>
  )
}

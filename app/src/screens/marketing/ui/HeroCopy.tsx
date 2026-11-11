import { CheckList } from '@/screens/marketing/ui/CheckList'
import { Icon } from '@/screens/marketing/ui/Icon'
import { HERO_CHECKS } from '@/screens/marketing/constants/HERO_CHECKS'
import { LINKS } from '@/screens/marketing/constants/LINKS'

export function HeroCopy() {
  return (
    <div className="hero-copy reveal-kids">
      <span className="pill">Free &amp; Open Source</span>
      <h1>
        Financial planning that <em>doesn't oversimplify you.</em>
      </h1>
      <p className="lead">See where your money goes, plan your budget, track spending as the month goes and project when you could retire.</p>
      <div className="ctas">
        <a className="btn btn-g" href={LINKS.app}>
          Try Ledger
        </a>
        <a className="btn btn-o" href={LINKS.repo}>
          <Icon name="github" />
          View on GitHub
        </a>
      </div>
      <CheckList items={HERO_CHECKS} />
    </div>
  )
}

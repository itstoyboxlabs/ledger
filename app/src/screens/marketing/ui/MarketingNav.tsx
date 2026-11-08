import { Icon } from '@/screens/marketing/ui/Icon'
import { LINKS } from '@/screens/marketing/constants/LINKS'
import { NAV_LINKS } from '@/screens/marketing/constants/NAV_LINKS'

type MarketingNavProps = { active?: string }

// The top bar. `active` is the id of the page you are on (see NAV_LINKS).
export function MarketingNav({ active }: MarketingNavProps) {
  return (
    <nav>
      <a className="logo" href={LINKS.home}>
        <img src="/logo-mark.png" alt="" />
        Ledger
      </a>
      <div className="links">
        {NAV_LINKS.map((link) => (
          <a key={link.id} href={link.href} className={link.id === active ? 'on' : undefined}>
            {link.label}
          </a>
        ))}
      </div>
      <div className="nav-r">
        <a className="gh" href={LINKS.repo}>
          <Icon name="github" />
          GitHub
        </a>
        <a className="btn btn-g btn-sm" href={LINKS.app}>
          Try Ledger
        </a>
      </div>
    </nav>
  )
}

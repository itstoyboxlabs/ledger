import { Icon } from '@/screens/marketing/ui/Icon'
import { APP_ACCOUNTS } from '@/screens/marketing/constants/APP_ACCOUNTS'

export function AppPreviewSidebar() {
  return (
    <div className="side">
      <div className="lg">
        <img src="/logo-mark.png" alt="" />
        Ledger
      </div>
      <div className="nv">
        <Icon>
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </Icon>
        About you
      </div>
      <div className="nv on">
        <Icon paths={['m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z']} />
        Spending
      </div>
      <div className="nv">
        <Icon>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </Icon>
        Budget
      </div>
      <div className="nv">
        <Icon paths={['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01']} />
        Log
      </div>
      <div className="nv">
        <Icon paths={['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z']} />
        Tools
      </div>
      <div className="nv">
        <Icon paths={['M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-7 10 7']} />
        Balances
      </div>
      <div className="nv">
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </Icon>
        Retirement
      </div>
      <h6>Accounts</h6>
      {APP_ACCOUNTS.map((a) => (
        <div className="acct" key={a.name}>
          <span className="b" style={{ background: a.color }}>
            {a.letter}
          </span>
          {a.name}
          <span className="dot" style={{ background: a.dot }}></span>
        </div>
      ))}
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { getAccounts } from '@/shared/utils/getAccounts'
import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { Separator } from '@/shared/ui/primitives/separator'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/shared/ui/primitives/sheet'
import { X } from 'lucide-react'
import type { Account } from '@/shared/types/Account'
import type { AccountType } from '@/shared/enums/AccountType'
import { GITHUB_URL } from '@/shared/constants/GITHUB_URL'
import { Icon } from '@/shared/ui/Icon'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'
import { NAV } from '@/shared/constants/NAV'
import { NextStatementLine } from '@/shared/ui/NextStatementLine'
import { TutorialNudge } from '@/shared/ui/TutorialNudge'
import { TUTORIAL_URL } from '@/shared/constants/TUTORIAL_URL'

// Left rail: wordmark, page nav, account filter. Collapses to a top strip
// of nav pills below the lg breakpoint.
type SidebarProps = {
  view: string
  setView: (view: string) => void
  accounts: string[]
  setAccounts: (accounts: string[]) => void
  onExport: () => void
  onUpload?: (() => void) | null
}

type RailAction = { icon: string; label: string; tip: string; onClick?: () => void; href?: string }

type AccountGroup = { bank: string; items: [string, Account][] }

export function Sidebar({ view, setView, accounts, setAccounts, onExport, onUpload }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  // each account row is an on/off switch for the Actuals account filter
  const acctOn = (id: string) => accounts.includes(id)
  // the filter only affects Actuals, so toggling one also takes you there
  const toggleAcct = (id: string) => {
    setAccounts(acctOn(id) ? accounts.filter((a) => a !== id) : [...accounts, id])
    setView('actuals')
  }
  // accounts grouped by bank in file order; checking, savings, then cards inside a group
  const TYPE_ORDER: Record<AccountType, number> = { checking: 0, savings: 1, card: 2 }
  const TYPE_COLOR: Record<AccountType, string> = { checking: 'var(--good)', savings: '#8b6cf6', card: '#6ea8ff' }
  const groups: AccountGroup[] = []
  for (const [id, a] of Object.entries(getAccounts())) {
    let g = groups.find((x) => x.bank === a.bank)
    if (!g) groups.push((g = { bank: a.bank, items: [] }))
    g.items.push([id, a])
  }
  for (const g of groups) g.items.sort((x, y) => TYPE_ORDER[x[1].type] - TYPE_ORDER[y[1].type])
  const acctRow = ([id, a]: [string, Account], done: () => void = () => {}) => {
    const active = acctOn(id)
    return (
      <Button variant="ghost"
        key={id}
        onClick={() => { toggleAcct(id); done() }}
        aria-pressed={active}
        title={active ? 'Showing in Spending. Click to hide.' : 'Hidden from Spending. Click to show.'}
        className={cn('h-auto w-full justify-start gap-3 whitespace-normal px-2.5 py-2 text-left text-[14px] font-normal', active ? 'text-white' : 'text-[var(--text-muted)]')}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate">
            {a.name}
            {a.last4 && <span className="tnum"> ••{a.last4}</span>}
          </span>
          <NextStatementLine account={id} />
        </span>
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={active ? { background: TYPE_COLOR[a.type] } : { boxShadow: 'inset 0 0 0 1.5px var(--text-muted)' }}
        />
      </Button>
    )
  }

  // the Tutorial icon carries the first-run nudge (its own click also counts as watching)
  const wrapNudge = (label: string, node: ReactNode) =>
    label === 'Tutorial' ? <TutorialNudge key={label}>{node}</TutorialNudge> : node

  // the rail's contents, shared by the desktop sidebar and the mobile drawer.
  // `done` closes the drawer after an action (a no-op on desktop).
  const body = (done: () => void = () => {}) => (
    <>
      <nav aria-label="Pages" className="mt-8 flex flex-col gap-1.5">
        {NAV.map(([v, label, icon]) => (
          <Button variant={view === v ? 'soft' : 'ghost'}
            key={v}
            aria-current={view === v ? 'page' : undefined}
            onClick={() => { setView(v); done() }}
            className={cn('h-auto justify-start gap-4 rounded-xl px-3.5 py-2.5 text-[15px]', view === v ? 'font-semibold' : 'font-normal text-[var(--text-secondary)] hover:text-white')}
          >
            <Icon name={icon} size={19} />
            {label}
          </Button>
        ))}
      </nav>

      <Separator className="mx-1 my-6 w-auto bg-[var(--grid)]" />

      <div className="px-3 text-[15px] font-semibold">Accounts</div>
      <div className="mt-3 flex min-h-0 flex-col gap-3 overflow-y-auto px-0.5">
        {groups.map((g) => (
          <div key={g.bank} className="flex flex-col gap-0.5">
            {g.bank && (
              <div className="flex items-center gap-2 px-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                <MerchantIcon name={g.bank} size={16} round />
                {g.bank}
              </div>
            )}
            {g.items.map((it) => acctRow(it, done))}
          </div>
        ))}
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-1 pt-4">
        {/* the rarer actions share one row of icons, each named by its tooltip */}
        <div className="mb-1 flex items-center justify-between px-1.5">
          {([
            { icon: 'download', label: 'Export data', tip: 'Export data: download everything as one ledger-data.json, your statements and your settings. Keep it as a backup.', onClick: onExport },
            onUpload && { icon: 'plus', label: 'Upload file', tip: 'Upload file: pick your ledger-data.json. It replaces what is stored on this device.', onClick: onUpload },
            { icon: 'play', label: 'Tutorial', tip: 'Tutorial: a video walk-through of every tab.', href: TUTORIAL_URL },
            { icon: 'github', label: 'GitHub', tip: 'GitHub: Ledger is open source, run it yourself.', href: GITHUB_URL },
          ] as (RailAction | null | undefined | false)[]).filter((a): a is RailAction => !!a).map((a) => (
            wrapNudge(a.label, (
            <UITooltip key={a.label}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild={!!a.href}
                  onClick={a.onClick && (() => { done(); a.onClick?.() })}
                  aria-label={a.label}
                  className="size-10 rounded-xl text-[var(--text-secondary)] hover:text-white"
                >
                  {a.href ? (
                    <a href={a.href} target="_blank" rel="noreferrer"><Icon name={a.icon} size={18} /></a>
                  ) : (
                    <Icon name={a.icon} size={18} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{a.tip}</TooltipContent>
            </UITooltip>
            ))
          ))}
        </div>
      </div>
    </>
  )

  const wordmark = (size: 'lg' | 'sm') => (
    <div className={cn('flex items-center gap-2 font-bold tracking-tight', size === 'lg' ? 'px-3 text-[28px]' : 'text-[20px]')}>
      <img src="/logo-mark.png" alt="Ledger logo" className={size === 'lg' ? 'h-[26px] w-auto' : 'h-[22px] w-auto'} />
      Ledger
    </div>
  )

  return (
    <>
      <aside className="sticky top-0 z-20 hidden h-screen w-[232px] shrink-0 flex-col border-r border-[var(--grid)] bg-[var(--sidebar)] px-4 pb-6 pt-7 lg:flex">
        {wordmark('lg')}
        {body()}
      </aside>

      {/* narrow screens: wordmark and one menu button. The button opens a drawer that
          fills the screen and holds everything the sidebar does. */}
      <div className="flex items-center justify-between border-b border-[var(--grid)] bg-[var(--sidebar)] px-4 py-3 lg:hidden">
        {wordmark('sm')}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu" className="size-10 rounded-xl text-[var(--text-secondary)] hover:text-white">
              <Icon name="menu" size={22} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="overflow-y-auto px-5 pb-6 pt-3">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Pages, accounts and tools</SheetDescription>
            <div className="flex items-center justify-between">
              {wordmark('sm')}
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close menu" className="size-10 rounded-xl text-[var(--text-secondary)] hover:text-white">
                  <X className="size-5" />
                </Button>
              </SheetClose>
            </div>
            <div className="-mt-4 flex min-h-0 flex-1 flex-col">{body(() => setMenuOpen(false))}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

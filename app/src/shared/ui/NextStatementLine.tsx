import { nextStatementDay } from '@/shared/utils/nextStatementDay'
import { NextStatementBadge } from '@/shared/ui/NextStatementBadge'

// "statement closes • 4th" sub line for a sidebar account row; nothing until there is history
type NextStatementLineProps = { account: string }

export function NextStatementLine({ account }: NextStatementLineProps) {
  if (!nextStatementDay(account)) return null
  return (
    <span className="block text-[11px] text-[var(--text-muted)]">
      statement closes<NextStatementBadge account={account} />
    </span>
  )
}

import { nextStatementDay } from '@/shared/utils/nextStatementDay'
import { ordinal } from '@/shared/utils/ordinal'

// "• 4th" — expected statement-closing day next to a header account badge,
// derived from real statement history (not guessed). ~ marks a drifted cycle.
type NextStatementBadgeProps = { account: string }

export function NextStatementBadge({ account }: NextStatementBadgeProps) {
  const est = nextStatementDay(account)
  if (!est) return null
  return (
    <span
      className="ml-1 inline-flex items-center gap-1 text-[var(--text-muted)]"
      title={
        est.approx
          ? `Closing day has varied across statements — most recent closed the ${ordinal(est.day)}`
          : `Statements have consistently closed on the ${ordinal(est.day)}`
      }
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {est.approx ? '~' : ''}
      {ordinal(est.day)}
    </span>
  )
}

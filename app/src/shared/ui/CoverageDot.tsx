import { missingAccounts } from '@/shared/utils/missingAccounts'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { acctName } from '@/shared/utils/acctName'

// one dot per month in the month picker: green when every account has statements
// for the whole month, yellow when some are missing (tooltip lists which)
type CoverageDotProps = { month: string }

export function CoverageDot({ month }: CoverageDotProps) {
  const missing = missingAccounts(month)
  const dot = (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: missing.length ? '#e8c76a' : 'var(--good)' }}
    />
  )
  const box = <span className="flex h-4 w-4 shrink-0 items-center justify-center">{dot}</span>
  if (!missing.length) return box
  return (
    <UITooltip>
      <TooltipTrigger asChild>{box}</TooltipTrigger>
      <TooltipContent side="left">Missing: {missing.map(acctName).join(', ')}</TooltipContent>
    </UITooltip>
  )
}

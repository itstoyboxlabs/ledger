import type { BudgetRow } from '@/shared/types/BudgetRow'
import { fmt0 } from '@/shared/utils/fmt0'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { Button } from '@/shared/ui/primitives/button'
import { X } from 'lucide-react'
import { Progress } from '@/shared/ui/primitives/progress'
import { MerchantIcon } from '@/shared/ui/MerchantIcon'

// One budget row's month-to-date meter: logged so far vs the planned amount.
type LogMeterProps = {
  row: BudgetRow
  spent: number
  onHide: () => void
}

export function LogMeter({ row, spent, onHide }: LogMeterProps) {
  const budget = row.amount
  const pct = budget > 0 ? Math.min(1, Math.max(0, spent) / budget) : 0
  const over = spent > budget + 0.005
  const left = budget - spent
  return (
    <div className="group rounded-lg bg-[var(--surface-2)] px-4 py-3 ring-1 ring-[var(--ring)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-[13px]">
          <MerchantIcon name={row.name} size={16} />
          <span className="truncate">{row.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="tnum text-[12px] text-[var(--text-muted)]">
            <span className="font-medium text-[var(--text-primary)]">{fmt0(spent)}</span> of {fmt0(budget)}
          </span>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs"
                onClick={onHide}
                aria-label={`Hide the ${row.name} meter`}
                className="-mr-1.5 text-[var(--text-muted)] opacity-0 hover:text-[var(--bad)] focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Hide this meter</TooltipContent>
          </UITooltip>
        </span>
      </div>
      <Progress
        value={pct * 100}
        aria-label={`${row.name} spent`}
        aria-valuetext={`${fmt0(spent)} of ${fmt0(budget)}`}
        indicatorColor={over ? 'var(--bad)' : 'var(--good)'}
        className="mt-2 h-1.5 bg-[var(--surface-1)]"
      />
      <div className="mt-1.5 tnum text-[12px]" style={{ color: over ? 'var(--bad)' : 'var(--text-muted)' }}>
        {over ? `${fmt0(-left)} over` : `${fmt0(left)} left`}
      </div>
    </div>
  )
}

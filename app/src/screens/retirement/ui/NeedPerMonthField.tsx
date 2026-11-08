import { Check } from 'lucide-react'
import { fmt0 } from '@/shared/utils/fmt0'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/ui/primitives/button'
import { Label } from '@/shared/ui/primitives/label'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/shared/ui/primitives/dropdown-menu'
import { InfoTip } from '@/shared/ui/InfoTip'
import { ToolField } from '@/shared/ui/ToolField'
import type { BudgetPresetOption } from '@/screens/retirement/types/BudgetPresetOption'
import type { RetireNeed } from '@/screens/retirement/types/RetireNeed'

// "Need per month" with a small "Budget" badge, styled like the Auto badges (FieldBadge), that
// opens a menu of saved Budget presets plus "Type it in". With a preset picked the field shows
// that preset's monthly expenses read-only. Under the field: where the number comes from, and
// today's Budget expenses for comparison.
type NeedPerMonthFieldProps = {
  // the typed number, kept even while a preset is picked
  value: number
  onChange: (v: number) => void
  need: RetireNeed
  // saved Budget presets, null while they load
  options: BudgetPresetOption[] | null
  // today's Budget expenses, null when there is no Budget to compare with
  today: number | null
  // a preset id, or null to type the number
  onPick: (id: string | null) => void
}

const LABEL = 'Need per month'
const TYPED_TIP = 'What you spend each month once you stop working. Pick a Budget preset to use its expenses instead.'

export function NeedPerMonthField({ value, onChange, need, options, today, onPick }: NeedPerMonthFieldProps) {
  const fromPreset = need.status === 'preset'
  // typing a new number while the picked preset is gone means you are typing it in now
  const typed = (v: number) => {
    if (need.status === 'missing') onPick(null)
    onChange(v)
  }
  return (
    <div>
      <div className="relative">
        {fromPreset ? (
          <Label className="block">
            <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
              {LABEL}
              <InfoTip
                tip={`The monthly expenses in your ${need.preset} Budget preset. Edit that preset on Budget to change it, or pick Type it in to use your own number.`}
                size={12}
              />
            </span>
            <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">
              {fmt0(need.monthly)}
            </div>
          </Label>
        ) : (
          <ToolField label={LABEL} value={value} onChange={typed} step={250} suffix="$" tip={TYPED_TIP} />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={fromPreset ? 'soft' : 'outline'}
              aria-label="Use a Budget preset"
              className={cn('absolute top-0 right-0 h-auto rounded px-1 py-0.5 text-[9px]', !fromPreset && 'text-[var(--text-muted)] hover:text-white')}
            >
              Budget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[220px] rounded-xl">
            <DropdownMenuLabel className="text-[12px] text-[var(--text-muted)]">Use a Budget preset</DropdownMenuLabel>
            {options === null ? (
              <DropdownMenuItem disabled className="text-[13px]">Loading presets</DropdownMenuItem>
            ) : options.length === 0 ? (
              <DropdownMenuItem disabled className="text-[13px]">No Budget presets yet. Save one on Budget.</DropdownMenuItem>
            ) : (
              options.map((o) => (
                <DropdownMenuItem key={o.id || o.name} onSelect={() => onPick(o.id)} className="justify-between gap-3 text-[13px]">
                  <span className={need.id === o.id ? 'font-medium' : 'text-[var(--text-secondary)]'}>{o.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="tnum text-[12px] text-[var(--text-muted)]">{fmt0(o.monthly)}</span>
                    <Check size={12} aria-hidden className={need.id === o.id ? '' : 'invisible'} />
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onPick(null)} className="justify-between gap-3 text-[13px]">
              <span className={need.id === null ? 'font-medium' : 'text-[var(--text-secondary)]'}>Type it in</span>
              <Check size={12} aria-hidden className={need.id === null ? '' : 'invisible'} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {fromPreset && (
        <p className="mt-1.5">
          <span className="inline-block rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] text-white ring-1 ring-[var(--ring)]">
            From the {need.preset} preset: {fmt0(need.monthly)} a month
          </span>
        </p>
      )}
      {need.status === 'missing' && (
        <p className="mt-1.5 text-[11px] text-[var(--text-secondary)]">
          The Budget preset you picked is gone, so this uses your typed number.
        </p>
      )}
      {today !== null && (
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">Your Budget today: {fmt0(today)} a month</p>
      )}
    </div>
  )
}

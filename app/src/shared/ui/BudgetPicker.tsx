import { Label } from '@/shared/ui/primitives/label'
import { Dropdown } from '@/shared/ui/Dropdown'

type BudgetPickerProps = {
  // a saved Budget's id, or '' for today's Budget
  value: string
  onChange: (id: string) => void
  options: { value: string; label: string }[]
  className?: string
}

// "Which Budget" dropdown for the tools that read the Budget: today's Budget or one of the saved ones.
export function BudgetPicker({ value, onChange, options, className }: BudgetPickerProps) {
  return (
    <Label className={className ?? 'block'}>
      <span className="text-[12px] text-[var(--text-muted)]">Which Budget</span>
      <div className="mt-1">
        <Dropdown
          label="Budget"
          hideLabel
          value={value && options.some((o) => o.value === value) ? value : 'today'}
          onChange={(v: string) => onChange(v === 'today' ? '' : v)}
          className="h-9 w-full justify-between rounded-lg bg-[var(--surface-1)] px-3 shadow-xs"
          options={options}
        />
      </div>
    </Label>
  )
}

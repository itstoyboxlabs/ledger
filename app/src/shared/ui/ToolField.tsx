import type { ReactNode } from 'react'
import { Label } from '@/shared/ui/primitives/label'
import { DraftNumberInput } from '@/shared/ui/DraftNumberInput'
import { InfoTip } from '@/shared/ui/InfoTip'

// shared tool-card atoms (module scope so inputs keep focus across re-renders)
//
// Uses a local "draft" string while focused so the field can pass through empty/
// partial states (backspacing to clear, typing "-" or "0." mid-number) without the
// browser snapping back to a forced "0" on every keystroke — the old `value={value}`
// + `parseFloat(e.target.value) || 0` combo made it impossible to clear a field to
// type a new number, since an empty string parses to NaN, falls back to 0, and the
// input immediately re-renders showing "0" again. Draft shows exactly what's typed;
// onChange still fires live for any keystroke that parses to a real number, and
// blur reverts to the last committed value if the field is left un-parseable.
type ToolFieldProps = {
  label: ReactNode
  value: number
  onChange: (value: number) => void
  step?: number
  suffix?: string
  tip?: ReactNode
  min?: number
  max?: number
}

export function ToolField({ label, value, onChange, step = 1, suffix, tip, min, max }: ToolFieldProps) {
  return (
    <Label className="block">
      <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
        {label}
        {tip && <InfoTip tip={tip} size={12} />}
      </span>
      <div className="mt-1">
        <DraftNumberInput boxed value={value} onChange={onChange} step={step} suffix={suffix} min={min} max={max} className="tnum" />
      </div>
    </Label>
  )
}

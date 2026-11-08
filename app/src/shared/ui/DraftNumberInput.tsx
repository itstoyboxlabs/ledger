import { useState } from 'react'
import { Input } from '@/shared/ui/primitives/input'
import { cn } from '@/shared/utils/cn'
import { Stepper } from '@/shared/ui/Stepper'

type DraftNumberInputProps = {
  value: number
  onChange: (value: number) => void
  className?: string
  step?: number
  boxed?: boolean
  suffix?: string
  min?: number
  max?: number
  ariaLabel?: string
}

export function DraftNumberInput({ value, onChange, className, step, boxed, suffix, min, max, ariaLabel }: DraftNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null) // null = not editing
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v))
  if (boxed) {
    return (
      <span className="group/num relative block w-full">
        <Input
          type="number"
          aria-label={ariaLabel}
          step={step}
          value={draft !== null ? draft : value}
          onFocus={(e) => {
            setDraft(String(value))
            e.target.select()
          }}
          onChange={(e) => {
            setDraft(e.target.value)
            const parsed = parseFloat(e.target.value)
            if (!Number.isNaN(parsed)) onChange(parsed)
          }}
          onBlur={() => {
            setDraft(null)
            // a typed number outside the allowed range snaps back when you leave the box
            if (Number.isFinite(value) && clamp(value) !== value) onChange(clamp(value))
          }}
          className={cn('no-native-spin', suffix ? 'pr-12' : 'pr-8', className)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-muted)]">
            {suffix}
          </span>
        )}
        <Stepper
          value={value}
          step={step}
          onChange={(v) => {
            const next = clamp(v)
            setDraft((d) => (d === null ? null : String(next)))
            onChange(next)
          }}
        />
      </span>
    )
  }
  return (
    <Input
      variant="inline"
      type="number"
      aria-label={ariaLabel}
      step={step}
      value={draft !== null ? draft : value}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => {
        setDraft(e.target.value)
        const parsed = parseFloat(e.target.value)
        if (!Number.isNaN(parsed)) onChange(parsed)
      }}
      onBlur={() => setDraft(null)}
      className={className}
    />
  )
}

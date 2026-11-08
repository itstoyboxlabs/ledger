import { fmt0 } from '@/shared/utils/fmt0'
import { Label } from '@/shared/ui/primitives/label'
import { FieldBadge } from '@/screens/retirement/ui/FieldBadge'
import { InfoTip } from '@/shared/ui/InfoTip'
import { ToolField } from '@/shared/ui/ToolField'

// like ToolField, but with a small "Auto" badge that swaps the editable input for a
// read-only value pulled from elsewhere in the app (a linked tool/tab). Reuses
// ToolField unmodified for the custom-input case, and mirrors its exact markup for
// the auto-display case, so both states stay pixel-identical to sibling ToolFields —
// the badge is overlaid via FieldBadge and never touches either layout.
type AutoToolFieldProps = {
  label: string
  auto: boolean
  onToggleAuto: () => void
  autoValue: number
  autoTip: string
  value: number
  onChange: (v: number) => void
  step?: number
  suffix?: string
  format?: (v: number) => string
  tip?: string
}

export function AutoToolField({ label, auto, onToggleAuto, autoValue, autoTip, value, onChange, step = 1, suffix, format = fmt0, tip }: AutoToolFieldProps) {
  // one explanation, on the info icon next to the label, whichever state the field is in
  const explain = auto
    ? `${autoTip} Click Auto to type your own number instead.`
    : `${tip ?? autoTip} Click Auto to use the calculated number again.`
  return (
    <div className="relative">
      {auto ? (
        <Label className="block">
          <span className="inline-flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
            {label}
            <InfoTip tip={explain} size={12} />
          </span>
          <div className="mt-1 rounded-lg bg-[var(--surface-1)] px-3 py-2 text-[13px] tnum ring-1 ring-[var(--ring)]">
            {format(autoValue)}
          </div>
        </Label>
      ) : (
        <ToolField label={label} value={value} onChange={onChange} step={step} suffix={suffix} tip={explain} />
      )}
      <FieldBadge label="Auto" active={auto} onClick={onToggleAuto} />
    </div>
  )
}

import { AutoToolField } from '@/screens/retirement/ui/AutoToolField'
import { ToolField } from '@/shared/ui/ToolField'
import { useRetireAge } from '@/screens/retirement/hooks/useRetireAge'
import { formatLongDate } from '@/shared/utils/formatLongDate'
import type { PlanningAge } from '@/shared/types/PlanningAge'

// "Current age": typed, or read from the About you page behind an Auto badge (the same
// pattern as the other Auto fields). Without an About you age it is a plain typed field.
type CurrentAgeFieldProps = {
  typed: number
  onChange: (v: number) => void
}

const TYPED_TIP = 'Your age today. The plan runs one row per year from here to the plan-to age.'

function autoTip(p: PlanningAge): string {
  if (p.source === 'balances' && p.on) {
    return `Using your age on the day you last updated Balances (${formatLongDate(p.on)}). Update Balances to move it forward.`
  }
  if (p.source === 'today') {
    return 'Using your age today, from the birth date on the About you tab. Balances has no "as of" date yet. Once it has one, this uses your age on that day so your plan does not drift.'
  }
  return 'Using the age you typed on the About you tab. Add your birth date there and this follows the day you last updated Balances.'
}

export function CurrentAgeField({ typed, onChange }: CurrentAgeFieldProps) {
  const { auto, planning, toggle } = useRetireAge(typed)
  if (planning == null) {
    return <ToolField label="Current age" value={typed} onChange={onChange} tip={`${TYPED_TIP} Add your birth date on the About you tab and it fills in here by itself.`} />
  }
  return (
    <AutoToolField
      label="Current age"
      auto={auto}
      onToggleAuto={toggle}
      autoValue={planning.age}
      autoTip={autoTip(planning)}
      value={typed}
      onChange={onChange}
      tip={TYPED_TIP}
      format={(v) => String(v)}
    />
  )
}

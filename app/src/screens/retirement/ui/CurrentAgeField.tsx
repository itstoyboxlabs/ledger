import { AutoToolField } from '@/screens/retirement/ui/AutoToolField'
import { ToolField } from '@/shared/ui/ToolField'
import { useRetireAge } from '@/screens/retirement/hooks/useRetireAge'

// "Current age": typed, or read from the About you page behind an Auto badge (the same
// pattern as the other Auto fields). Without an About you age it is a plain typed field.
type CurrentAgeFieldProps = {
  typed: number
  onChange: (v: number) => void
}

const TYPED_TIP = 'Your age today. The plan runs one row per year from here to the plan-to age.'

export function CurrentAgeField({ typed, onChange }: CurrentAgeFieldProps) {
  const { auto, aboutAge, toggle } = useRetireAge(typed)
  if (aboutAge == null) {
    return <ToolField label="Current age" value={typed} onChange={onChange} tip={`${TYPED_TIP} Add your age on the About you tab and it fills in here by itself.`} />
  }
  return (
    <AutoToolField
      label="Current age"
      auto={auto}
      onToggleAuto={toggle}
      autoValue={aboutAge}
      autoTip="Your age from the About you tab. It goes up by one each January on its own."
      value={typed}
      onChange={onChange}
      tip={TYPED_TIP}
      format={(v) => String(v)}
    />
  )
}

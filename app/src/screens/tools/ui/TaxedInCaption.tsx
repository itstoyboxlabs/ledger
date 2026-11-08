import { STATES } from '@/shared/constants/STATES'
import { Button } from '@/shared/ui/primitives/button'

// "Taxed in <state>. Change" caption: the state is set once on the Balances page
type TaxedInCaptionProps = {
  state: string
  onChange: () => void
}

export function TaxedInCaption({ state, onChange }: TaxedInCaptionProps) {
  return (
    <div className="pb-2 text-[12px] text-[var(--text-muted)]">
      Taxed in {STATES[state]?.label}.{' '}
      <Button variant="link" size="sm" onClick={onChange} className="h-auto p-0 text-[12px]">
        Change
      </Button>
    </div>
  )
}

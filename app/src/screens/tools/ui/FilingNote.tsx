import { Button } from '@/shared/ui/primitives/button'
import { FilingStatus } from '@/shared/enums/FilingStatus'
import { useFilingStatus } from '@/shared/hooks/useFilingStatus'

// "Using Married filing jointly from About you." Shown on the tax tools only when the filing
// status is not the single default, so a changed number always has a visible reason.
type FilingNoteProps = {
  onOpen?: () => void
}

export function FilingNote({ onOpen }: FilingNoteProps) {
  const [filing] = useFilingStatus()
  if (filing !== FilingStatus.mfj) return null
  return (
    <p className="mt-2 text-[12px] text-[var(--text-muted)]">
      Using Married filing jointly from About you.{' '}
      {onOpen && (
        <Button variant="link" size="sm" onClick={onOpen} className="h-auto p-0 text-[12px]">
          Change
        </Button>
      )}
    </p>
  )
}

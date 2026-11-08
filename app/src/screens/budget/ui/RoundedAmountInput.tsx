import { useState } from 'react'
import { Input } from '@/shared/ui/primitives/input'

// Default expense-row amount input: whole dollars always, everywhere — display,
// while editing, and in the stored value itself. Rounds UP (ceiling) on both entry
// and commit, so there's never a hidden-cents state to reveal on focus. Keeps a
// draft string only to dodge the "trapped at 0" bug (see ToolField) — not for
// precision-hiding, since there's no precision to hide anymore.
type RoundedAmountInputProps = {
  value: number
  onCommit: (value: number) => void
}

export function RoundedAmountInput({ value, onCommit }: RoundedAmountInputProps) {
  const [draft, setDraft] = useState<string | null>(null) // null = not editing
  return (
    <Input variant="inline"
      type="number"
      step="1"
      value={draft !== null ? draft : Math.ceil(value)}
      onFocus={() => setDraft(String(Math.ceil(value)))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(draft ?? '')
        onCommit(Number.isNaN(parsed) ? 0 : Math.ceil(parsed))
        setDraft(null)
      }}
      className="-mr-1.5 w-28 text-right tnum max-sm:w-[72px]"
    />
  )
}

import { useState } from 'react'
import { Input } from '@/shared/ui/primitives/input'

// Default expense-row amount input. While blurred it shows whole dollars, rounded up.
// Focus reveals the exact stored value. Display only: focusing and leaving the field
// never changes what is stored. Blur commits exactly what was typed, and only when the
// draft actually changed. The draft string also dodges the "trapped at 0" bug (see ToolField).
type RoundedAmountInputProps = {
  value: number
  label: string
  onCommit: (value: number) => void
}

export function RoundedAmountInput({ value, label, onCommit }: RoundedAmountInputProps) {
  const [draft, setDraft] = useState<string | null>(null) // null = not editing
  return (
    <Input variant="inline"
      type="number"
      aria-label={label}
      step="1"
      value={draft !== null ? draft : Math.ceil(value)}
      onFocus={() => setDraft(String(value))}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null && draft !== String(value)) {
          const parsed = parseFloat(draft)
          const next = Number.isNaN(parsed) ? 0 : parsed
          if (next !== value) onCommit(next)
        }
        setDraft(null)
      }}
      className="-mr-1.5 w-28 text-right tnum max-sm:w-[72px]"
    />
  )
}

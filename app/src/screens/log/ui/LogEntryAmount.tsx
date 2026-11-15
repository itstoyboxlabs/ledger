import { useState } from 'react'
import { Input } from '@/shared/ui/primitives/input'
import { fmt } from '@/shared/utils/fmt'
import { parseSumExpr } from '@/shared/utils/parseSumExpr'

type LogEntryAmountProps = { value: number; onChange: (value: number) => void; label: string }

// A logged amount you can click to change. Type a number or a sum like "12 + 4.5". Enter or leaving the box
// saves it, Escape puts the old amount back. A negative amount is a credit.
export function LogEntryAmount({ value, onChange, label }: LogEntryAmountProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const done = (save: boolean) => {
    if (save && draft !== null) {
      const next = parseSumExpr(draft)
      if (next.terms.length > 0) {
        const n = Math.round(next.total * 100) / 100
        if (n !== value) onChange(n)
      }
    }
    setDraft(null)
  }
  if (draft === null) {
    return (
      <button
        type="button"
        aria-label={`Change amount: ${label}`}
        onClick={() => setDraft(String(value))}
        className="tnum -mr-2 cursor-text rounded-lg px-2 py-0.5 hover:bg-[var(--surface-1)]"
        style={value < 0 ? { color: 'var(--good)' } : undefined}
      >
        {fmt(value)}
      </button>
    )
  }
  return (
    <Input
      autoFocus
      aria-label={`Amount: ${label}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={() => done(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') done(true)
        if (e.key === 'Escape') done(false)
      }}
      className="tnum -mr-2 ml-auto h-7 w-24 text-right"
    />
  )
}

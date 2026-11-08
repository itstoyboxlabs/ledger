import type { ReactNode } from 'react'
// a nested mini-container within a FieldGroup — pairs a couple of related fields
// (e.g. an amount + the age it happens) under their own label, so a long row of
// same-looking inputs reads as distinct events instead of one undifferentiated strip
type EventPairProps = { label: string; children?: ReactNode }

export function EventPair({ label, children }: EventPairProps) {
  return (
    <div className="rounded-xl bg-[var(--surface-2)] p-3 ring-1 ring-[var(--ring)]">
      <div className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

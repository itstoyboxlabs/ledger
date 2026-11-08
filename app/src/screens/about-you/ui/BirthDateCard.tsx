import { useId, useState } from 'react'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Label } from '@/shared/ui/primitives/label'
import { Card } from '@/shared/ui/Card'
import { useBirthDate } from '@/shared/hooks/useBirthDate'
import { ageOn } from '@/shared/utils/ageOn'
import { formatBirthDate } from '@/shared/utils/formatBirthDate'
import { parseBirthDate } from '@/shared/utils/parseBirthDate'
import { todayIso } from '@/shared/utils/todayIso'

// a typed date that looks finished (a four-digit year at the end), so an error can show while typing
const looksComplete = (text: string) => /[-/]\d{4}$/.test(text.trim())

// Your birth date, typed as MM-DD-YYYY (no date picker). It is checked as you type and when you
// leave the box, and saved as YYYY-MM-DD. Retirement reads the age it gives (see usePlanningAge).
export function BirthDateCard() {
  const { birthDate, savedAge, setBirthDate, clear } = useBirthDate()
  // what is in the box while you type, so a half-typed date is not thrown away
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const errorId = useId()
  const today = todayIso()

  const check = (text: string, leaving: boolean) => {
    if (text.trim() === '') {
      setError(null)
      if (leaving) clear()
      return
    }
    const result = parseBirthDate(text, today)
    if ('iso' in result) {
      setError(null)
      if (result.iso !== birthDate) setBirthDate(result.iso)
      if (leaving) setDraft(null)
    } else {
      setError(leaving || looksComplete(text) ? result.error : null)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Your birth date</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Ledger asks for your birth date so it always knows your age. The Retirement page uses your
        age to plan each year until the end of the plan and to time Social Security, and it shows the
        age each debt is paid off. Your birth date is stored only on this device and in the file you
        export.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Retirement uses your age on the day you last updated Balances, not today. Your balances are
        only as fresh as that day, so your plan stays put until you update them and does not drift
        on its own.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <Label className="block w-[160px]">
          <span className="text-[12px] text-[var(--text-muted)]">Birth date</span>
          <Input
            className="mt-1 tnum"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            placeholder="MM-DD-YYYY"
            maxLength={10}
            value={draft ?? (birthDate ? formatBirthDate(birthDate) : '')}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onFocus={() => setDraft(birthDate ? formatBirthDate(birthDate) : '')}
            onBlur={(e) => check(e.target.value, true)}
            onChange={(e) => {
              setDraft(e.target.value)
              check(e.target.value, false)
            }}
          />
        </Label>
        {(birthDate || savedAge != null) && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 pb-2 text-[12px]"
            onClick={() => {
              clear()
              setDraft(null)
              setError(null)
            }}
          >
            Clear my birth date
          </Button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-[12px] text-[var(--bad)]">
          {error}
        </p>
      )}
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
        {birthDate
          ? `You are ${ageOn(birthDate, today)} today.`
          : savedAge != null
            ? `You typed your age as ${savedAge} before Ledger asked for a birth date. Retirement keeps using ${savedAge} until you add your birth date.`
            : 'No birth date yet. Until you add one, Retirement uses the age typed on that page.'}
      </p>
    </Card>
  )
}

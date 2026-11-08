import { useState } from 'react'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Label } from '@/shared/ui/primitives/label'
import { Card } from '@/shared/ui/Card'
import { useAboutYouAge } from '@/shared/hooks/useAboutYouAge'

// Your age, typed once. It is saved with the year it was typed, so it goes up by one each
// January without you touching it. Retirement reads it as its current age.
export function AgeCard() {
  const { entry, age, setAge, clear } = useAboutYouAge()
  // what is in the box while you type, so it can be empty for a moment
  const [draft, setDraft] = useState<string | null>(null)
  const year = new Date().getFullYear()
  return (
    <Card className="p-5">
      <h2 className="text-[15px] font-semibold">Your age</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Type your age once. It goes up by one every January on its own, so you never have to come
        back and change it. The Retirement page uses it as your current age to plan each year from
        now until the end of the plan, to time Social Security and to show the age each debt is paid
        off.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <Label className="block w-[140px]">
          <span className="text-[12px] text-[var(--text-muted)]">Your age</span>
          <Input
            className="mt-1 tnum"
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            step={1}
            placeholder="35"
            value={draft ?? (age ?? '')}
            onFocus={() => setDraft(age == null ? '' : String(age))}
            onBlur={() => setDraft(null)}
            onChange={(e) => {
              const text = e.target.value
              setDraft(text)
              if (text.trim() === '') return clear()
              const n = Number(text)
              if (Number.isFinite(n) && n >= 0 && n <= 120) setAge(n)
            }}
          />
        </Label>
        {entry && (
          <Button variant="link" size="sm" className="h-auto p-0 pb-2 text-[12px]" onClick={clear}>
            Clear my age
          </Button>
        )}
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-muted)]">
        {age == null
          ? 'No age yet. Until you add one, Retirement uses the age typed on that page.'
          : entry && entry.asOf < year
            ? `You are ${age} now. You typed ${entry.age} in ${entry.asOf}, and it has gone up by one each January since.`
            : `You are ${age}. Next January this becomes ${age + 1} by itself.`}
      </p>
    </Card>
  )
}

import { ageOn } from '@/shared/utils/ageOn'
import { isIsoDate } from '@/shared/utils/isIsoDate'
import { MAX_AGE } from '@/shared/constants/MAX_AGE'

// A birth date typed as MM-DD-YYYY (slashes work too, and one-digit months and days) checked
// against today (YYYY-MM-DD). Gives the date as YYYY-MM-DD, or a short plain error.
export function parseBirthDate(text: string, today: string): { iso: string } | { error: string } {
  const m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(text.trim())
  if (!m) return { error: 'Type your birth date as MM-DD-YYYY, like 04-15-1990.' }
  const iso = `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`
  if (!isIsoDate(iso)) return { error: 'That date does not exist. Check the month and the day.' }
  if (iso > today) return { error: 'That date is in the future. Check the year.' }
  if (ageOn(iso, today) > MAX_AGE) return { error: `That would make you older than ${MAX_AGE}. Check the year.` }
  return { iso }
}

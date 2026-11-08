import { missingAccounts } from '@/shared/utils/missingAccounts'

// Budget-vs-actual buckets by CALENDAR month (1st to end of month), deliberately.
// Statement cycles would catch each recurring bill exactly once, but they span
// uneven windows — "Aug 2026" as 07/05–08/13 is 40 days and reads as a lie. Josh's
// call: plain months, and accept that a bill landing early (Verizon billed 07/01
// AND 07/31) double-counts in one month and shows zero the next. What we DO owe the
// reader is a warning when a month isn't fully covered by statements yet, which is
// the normal case for the most recent month.
// A month is complete only if EVERY account has statements covering every day of it
// (the coverage system, not just "ends before the latest statement"): once older
// statements are backfilled there can be gaps in the middle of the timeline — the
// credit card has nothing for Apr 5 – May 4 2026 — and a month with a hole must not
// read as a clean full month.
export function isMonthComplete(ym: string): boolean {
  return missingAccounts(ym).length === 0
}

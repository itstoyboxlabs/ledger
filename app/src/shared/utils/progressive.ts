import type { TaxBracket } from '@/shared/types/TaxBracket'
// Reusable state/federal tax estimator (single filer, ~2026 figures).
// Approximations: standard deductions applied, no credits/pre-tax deductions.
// Good for planning, not for filing.

export function progressive(income: number, brackets: readonly TaxBracket[]): number {
  let tax = 0
  let prev = 0
  for (const [cap, rate] of brackets) {
    if (income <= prev) break
    tax += (Math.min(income, cap) - prev) * rate
    prev = cap
  }
  return tax
}

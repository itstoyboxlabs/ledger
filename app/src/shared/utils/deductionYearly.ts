import type { Deduction } from '@/shared/types/Deduction'
export function deductionYearly(d: Pick<Deduction, 'unit' | 'amount'>, salary: number): number {
  const n = Number(d.amount) || 0
  return d.unit === 'pct' ? (salary * n) / 100 : d.unit === 'mo' ? n * 12 : n
}

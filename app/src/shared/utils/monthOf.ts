import type { Transaction } from '@/shared/types/Transaction'
export function monthOf(t: Pick<Transaction, 'date'>): string {
  return t.date.slice(0, 7) // YYYY-MM
}

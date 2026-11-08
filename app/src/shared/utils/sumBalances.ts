import type { Debt } from '@/shared/types/Debt'
export const sumBalances = (debts: Pick<Debt, 'balance'>[]): number => debts.reduce((s: number, d) => s + d.balance, 0)

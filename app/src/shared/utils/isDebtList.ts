import type { Debt } from '@/shared/types/Debt'
export const isDebtList = (v: unknown): v is Debt[] =>
  Array.isArray(v) && v.every((d: Partial<Debt> | null) => !!d && typeof d.id === 'string' && typeof d.balance === 'number')

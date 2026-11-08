import type { Period } from '@/shared/types/Period'

// statement id (like "chk-2026-05") -> period
export type Periods = Record<string, Period>

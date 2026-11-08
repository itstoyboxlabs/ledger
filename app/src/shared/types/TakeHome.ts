import type { Deduction } from '@/shared/types/Deduction'

export interface TakeHome {
  salary: number
  deductions: Deduction[]
}

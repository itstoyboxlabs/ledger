import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetireExtra } from '@/screens/retirement/types/RetireExtra'
import type { RetireSs } from '@/screens/retirement/types/RetireSs'

// The saved Retirement plan (`retireCalc`).
export interface RetireState {
  age: number
  retireAge: number
  accessAge: number
  endAge: number
  start401k: number
  startSavings: number
  startFrom: 'balances' | 'typed'
  startOff: string[]
  contrib401k: number
  contribSavings: number
  auto401k: boolean
  autoSavings: boolean
  withdrawMo: number
  taxPct: number
  autoTax: boolean
  // tax what comes out of the pre-tax 401k as income (saves without it read as on)
  tax401k: boolean
  ss: RetireSs
  events: RetireEvent[]
  extras: RetireExtra[]
}

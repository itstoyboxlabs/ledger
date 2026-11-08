import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'
import type { RetirePay } from '@/screens/retirement/types/RetirePay'
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
  ss: RetireSs
  events: RetireEvent[]
  pay: RetirePay
  // Contributions grow a year on the no-plan row: grows today's 401k and savings each working year.
  // Plan pay changes copies it into the periods, Back to one period copies it back.
  raisePct: number
}

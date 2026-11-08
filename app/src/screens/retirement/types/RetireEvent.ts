import type { RetireEventKind } from '@/screens/retirement/enums/RetireEventKind'
import type { RetireRepeat } from '@/screens/retirement/enums/RetireRepeat'

// Money in or out at a certain age. `auto: 'equity'` links it to the Equity payout tool. `debtId` and `custom`
// only exist on debt payoff events. `to: '401k'` sends a money-in event to the retirement account (locked until
// the access age) instead of savings. `untilRetire` makes a repeating money-in event stop when you retire,
// whatever the retire age, in place of its number of years (saving lines from before Events replaced them).
export interface RetireEvent {
  id: string
  name: string
  amount: number
  kind: RetireEventKind
  age: number
  repeat: RetireRepeat
  years: number
  auto?: 'equity'
  debtId?: string
  custom?: boolean
  to?: '401k'
  untilRetire?: boolean
}

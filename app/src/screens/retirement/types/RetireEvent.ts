import type { RetireEventKind } from '@/screens/retirement/enums/RetireEventKind'
import type { RetireRepeat } from '@/screens/retirement/enums/RetireRepeat'

// Money in or out at a certain age. `auto: 'equity'` links it to the Equity payout tool. `debtId` and `custom`
// only exist on debt payoff events.
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
}

// what an event adds (positive) or costs (positive, `kind` says which way) in a given
// age. Monthly events are summed over the 12 months. Every two years pays at the start
// age and every second year after it, inside the "for N years" window.
import type { RetireEvent } from '@/screens/retirement/types/RetireEvent'

export function eventAmountAt(e: Pick<RetireEvent, 'age' | 'repeat'>, age: number, amount: number, years: number): number {
  const start = e.age
  if (e.repeat === 'once') return age === start ? amount : 0
  if (age < start || age >= start + years) return 0
  if (e.repeat === 'month') return amount * 12
  if (e.repeat === '2year') return (age - start) % 2 === 0 ? amount : 0
  return amount
}

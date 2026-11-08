import { fmt0 } from '@/shared/utils/fmt0'

// a whole-dollar budget diff with its sign: "+$50" under budget, "−$50" over
export function diffLabel(diff: number): string {
  return (diff < 0 ? '−' : '+') + fmt0(Math.abs(diff))
}

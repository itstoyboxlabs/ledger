import type { SimPayPeriod } from '@/screens/retirement/types/SimPayPeriod'

// The pay plan as the projection needs it. `planRetireAge` is the saved retire age: a
// period whose until age is past it keeps going after you retire, whatever retire age is
// being tried.
export interface RetireSimPay {
  periods: SimPayPeriod[]
  planRetireAge: number
}

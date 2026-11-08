import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

// The pay plan. No periods means today's pay and saving every working year, exactly as
// before the plan existed.
export interface RetirePay {
  periods: PayPeriod[]
}

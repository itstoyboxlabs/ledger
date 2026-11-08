import type { PayMath } from '@/screens/retirement/types/PayMath'
import type { PayPeriod } from '@/screens/retirement/types/PayPeriod'

// The pay plan as the projection needs it. `math` turns a gross salary and a 401k
// setting into take-home pay and 401k money (Take-home deductions and tax).
// `budgetSavings` is the Budget's savings per year today (the Auto savings base) and
// `extrasSavings` the user's own savings lines, added every working year.
// `planRetireAge` is the saved retire age: a period whose until age is past it keeps
// paying after you retire, whatever retire age is being tried.
export interface RetireSimPay {
  periods: PayPeriod[]
  planRetireAge: number
  todaySalary: number
  math: (gross: number, k401: PayPeriod['k401']) => PayMath
  budgetSavings: number
  extrasSavings: number
  ssFromPlan: boolean
}

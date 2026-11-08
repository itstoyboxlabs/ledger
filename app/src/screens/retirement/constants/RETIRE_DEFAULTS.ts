// Saved Retirement state (`retireCalc`) used to hold three fixed one-time events
// (downAmt/downAge, carAmt/carAge, optAmt/optAge/autoOpt) and no Social Security or
// match fields. Anything without an `events` list is that old shape. It is read with
// the OLD defaults filled in (so saves and presets that never stored a field behave as
// they always did) and converted: the three events become list entries with the same
// amounts and ages and Social Security is off. The employer match the old code assumed
// (100%) is moved onto the Take-home 401k deduction once by migrateEmployerMatch. New
// users start from RETIRE_DEFAULTS.
import type { RetireState } from '@/screens/retirement/types/RetireState'

export const RETIRE_DEFAULTS: RetireState = {
  age: 35, retireAge: 60, accessAge: 60, endAge: 95,
  start401k: 0, startSavings: 0,
  startFrom: 'balances', startOff: [], // starting balances come from Balances (minus anything unchecked) or are typed
  contrib401k: 0, contribSavings: 0,
  auto401k: true, autoSavings: true,
  withdrawMo: 5000, taxPct: 15, autoTax: true,
  ss: { on: true, claimAge: 67, auto: true, monthly: 0 },
  events: [],
  raisePct: 0, // Raise a year with no plan; 0 keeps the numbers flat, as before
  pay: { periods: [] }, // the pay plan; no periods means today's pay every working year
}

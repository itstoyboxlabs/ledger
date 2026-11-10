import type { UsageEvent } from '@/shared/types/UsageEvent'

// Which saved value ("ledger:<key>") counts as which usage event when a person changes it. Keys that are only
// filters or sort orders are left out on purpose.
export const PERSISTED_USAGE_EVENTS: Readonly<Record<string, UsageEvent>> = {
  birthDate: 'age_updated',
  age: 'age_updated',
  filingStatus: 'filing_status_changed',
  taxState: 'tax_state_changed',
  budgetIncomeOverride: 'income_changed',
  assets: 'balances_changed',
  assetsAsOf: 'balances_changed',
  debts: 'debts_changed',
  retireCalc: 'retirement_changed',
  retirePortfolio: 'retirement_changed',
  retirePortfolioAfter: 'retirement_changed',
  retireIncludeDebt: 'retirement_changed',
  retireAgeAuto: 'retirement_changed',
  toolsShown: 'tools_changed',
  lists: 'lists_changed',
  takeHome: 'tool_takehome',
  hourlyCalc: 'tool_hourly',
  rentScenario3: 'tool_rent_scenarios',
  rentIncomeCalc2: 'tool_rent_to_income',
  rentalCalc: 'tool_rental_cost',
  stockCalc2: 'tool_stock',
  vacationCalc: 'tool_vacation',
  debtPayoff: 'tool_debt',
  cashRange: 'tool_cash',
}

// Every event key the app may send (see utils/track.ts). The server keeps the same list in api/usage.js and drops
// anything else. A key names what happened, never a value: no amounts, names, notes or dates are ever sent.
export const USAGE_EVENTS = [
  'app_opened', 'screen_opened', 'crash',
  'age_updated', 'filing_status_changed', 'tax_state_changed', 'income_changed',
  'balances_changed', 'debts_changed', 'budget_changed', 'log_changed', 'notes_changed',
  'retirement_changed', 'preset_saved', 'preset_removed', 'tools_changed', 'lists_changed',
  'tool_takehome', 'tool_hourly', 'tool_rent_scenarios', 'tool_rent_to_income', 'tool_rental_cost',
  'tool_stock', 'tool_vacation', 'tool_debt', 'tool_cash',
  'import_completed', 'sample_loaded', 'export_downloaded',
] as const

// A note about the pay plan. `id` is the period it belongs to, or null for the plan as a
// whole. 'warn' means something is likely a mistake, 'info' just explains.
export interface PayIssue {
  id: string | null
  tone: 'warn' | 'info'
  text: string
}

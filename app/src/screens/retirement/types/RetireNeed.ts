// Where Retirement's "Need per month" comes from right now.
//   typed:   the number typed in the field (no preset picked)
//   loading: a preset is picked but Budget presets have not loaded yet, so the typed number stands in
//   preset:  the picked Budget preset's monthly expenses
//   missing: the picked preset is gone (deleted), so the typed number is used
// `id` is the picked preset's id and `preset` its name, known only once it is found.
export interface RetireNeed {
  monthly: number
  status: 'typed' | 'loading' | 'preset' | 'missing'
  preset: string | null
  id: string | null
}

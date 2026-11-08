// How much of a month the loaded statements cover. `ranges` holds the covered [start, end] day pairs; `missing`
// is 'all' when nothing covers the month.
export interface CoverageResult {
  full: boolean
  ranges?: [string, string][]
  missing?: 'all'
}

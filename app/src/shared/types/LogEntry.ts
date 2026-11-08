// One thing spent between statements, counted against a budget row. A negative amount is a credit.
export interface LogEntry {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  note: string
  rowId: string
  createdAt: number
}

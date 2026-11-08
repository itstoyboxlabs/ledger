// How the entries table is sorted. `dir` is 1 for ascending, -1 for descending.
export interface LogSort {
  key: 'date' | 'note' | 'row' | 'amount'
  dir: 1 | -1
}

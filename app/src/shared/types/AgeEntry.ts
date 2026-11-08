// An age typed on the About you page before it asked for a birth date (`ledger:age`), with the
// year it was typed. Old saves still have it: it is read as a fixed age until a birth date is
// entered, and `asOf` is no longer used.
export interface AgeEntry {
  age: number
  asOf: number
}

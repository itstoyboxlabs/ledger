// The earliest retire age after `age` (and before `endAge`) at which the money never runs out.
// A linear scan: cheap (at most ~80 candidate ages times ~80 simulated years each) and correct
// even when surviving is not monotonic in the retire age, since one-time events land at fixed
// ages whenever you retire. Null when no age works.
export function earliestSafeRetireAge(
  age: number,
  endAge: number,
  simulate: (retireAge: number) => { runOutAge: number | null },
): number | null {
  for (let candidate = age + 1; candidate < endAge; candidate++) {
    if (simulate(candidate).runOutAge === null) return candidate
  }
  return null
}

// full years from a birth date to a day, both YYYY-MM-DD. Someone born on February 29 turns a
// year older on March 1 in years without one. Never below zero.
export function ageOn(birthIso: string, onIso: string): number {
  const [by, bm, bd] = birthIso.split('-').map(Number)
  const [y, m, d] = onIso.split('-').map(Number)
  const hadBirthday = m > bm || (m === bm && d >= bd)
  return Math.max(0, y - by - (hadBirthday ? 0 : 1))
}

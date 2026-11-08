export function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13
  const last = n % 10
  return n + (!teen && last === 1 ? 'st' : !teen && last === 2 ? 'nd' : !teen && last === 3 ? 'rd' : 'th')
}

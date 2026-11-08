// a saved birth date (YYYY-MM-DD) the way it is typed on About you: MM-DD-YYYY
export function formatBirthDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${m}-${d}-${y}`
}

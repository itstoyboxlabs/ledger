// A crash message that is safe to send: emails and long numbers (more than 4 digits) removed, cut to 300 characters.
export function scrubError(message: string): string {
  return String(message)
    .replace(/\S+@\S+/g, '[email]')
    .replace(/\d[\d,._-]*/g, (m) => (m.replace(/\D/g, '').length > 4 ? '#' : m))
    .slice(0, 300)
}

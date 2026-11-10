// One random id per page load, held in memory only.
const SESSION_ID = crypto.randomUUID()

export function getUsageSessionId(): string {
  return SESSION_ID
}

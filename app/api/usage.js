// Records which screen or tool is used, by a random id, using the state Vercel adds to every request.
// It never receives or stores amounts, merchants, names, notes or dates of birth: only an event key from the list
// below, a route, a random user id and session id and, for a crash, a short scrubbed message. Unknown keys are
// dropped. It does nothing unless the two env vars are set, so a fork of this repo is unaffected.
// Table and functions: see sql/usage.sql. The browser side is src/shared/utils/track.ts.

// Keep in step with src/shared/constants/USAGE_EVENTS.ts (a unit test compares the two lists).
const ALLOWED = new Set([
  'app_opened', 'screen_opened', 'crash',
  'age_updated', 'filing_status_changed', 'tax_state_changed', 'income_changed',
  'balances_changed', 'debts_changed', 'budget_changed', 'log_changed', 'notes_changed',
  'retirement_changed', 'preset_saved', 'preset_removed', 'tools_changed', 'lists_changed',
  'tool_takehome', 'tool_hourly', 'tool_rent_scenarios', 'tool_rent_to_income', 'tool_rental_cost',
  'tool_stock', 'tool_vacation', 'tool_debt', 'tool_cash',
  'import_completed', 'sample_loaded', 'export_downloaded',
])

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ROUTE = /^\/(app(\/[a-z0-9-]{1,30})?|tutorial)?$/

// a crash message with long numbers and emails removed, cut to 300 characters
function scrub(text) {
  return String(text)
    .replace(/\S+@\S+/g, '[email]')
    .replace(/\d[\d,._-]*/g, (m) => (m.replace(/\D/g, '').length > 4 ? '#' : m))
    .slice(0, 300)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const url = process.env.VISITS_SUPABASE_URL
  const key = process.env.VISITS_SUPABASE_KEY
  const ua = String(req.headers['user-agent'] || '')
  if (req.method !== 'POST' || !url || !key || /bot|crawl|spider|preview|headless/i.test(ua)) {
    return res.status(204).end()
  }
  const country = String(req.headers['x-vercel-ip-country'] || '').slice(0, 2).toUpperCase()
  const region = String(req.headers['x-vercel-ip-country-region'] || '').slice(0, 3).toUpperCase()
  if (!/^[A-Z]{2}$/.test(country) || !/^[A-Z0-9]{0,3}$/.test(region)) return res.status(204).end()

  let body = req.body
  try {
    if (typeof body === 'string') body = JSON.parse(body)
  } catch {
    return res.status(204).end()
  }
  if (!body || !UUID.test(String(body.user)) || !UUID.test(String(body.session)) || !Array.isArray(body.events)) {
    return res.status(204).end()
  }
  const events = []
  for (const e of body.events.slice(0, 25)) {
    if (!e || !ALLOWED.has(e.event) || !ROUTE.test(String(e.route))) continue
    // only a crash carries a message
    const error = e.event === 'crash' && typeof e.error === 'string' && e.error ? scrub(e.error) : null
    events.push({ event: e.event, route: e.route, error })
  }
  if (!events.length) return res.status(204).end()
  try {
    await fetch(`${url}/rest/v1/rpc/record_usage`, {
      method: 'POST',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_user: body.user, p_session: body.session, p_country: country, p_region: region, p_events: events }),
    })
  } catch {
    // tracking is best effort
  }
  return res.status(204).end()
}

// Counts one visit per browser session by US state, using the region Vercel adds to every request.
// Stores only day + country + state + a count: no IP, no user agent, no cookie. It does nothing unless the
// two env vars below are set, so a fork of this repo is unaffected.
// Table and function: see sql/visits.sql.

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
  try {
    await fetch(`${url}/rest/v1/rpc/record_visit`, {
      method: 'POST',
      headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_country: country, p_region: region }),
    })
  } catch {
    // counting is best effort
  }
  return res.status(204).end()
}

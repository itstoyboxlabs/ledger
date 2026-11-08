export async function httpPost(url: string, body: unknown): Promise<void> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`${url} ${r.status}`)
}

// Turns a merchant name as it appears in a data file or on a statement into the key used by the logo catalog's
// `names` map. The catalog build script (app/scripts/build-icon-catalog.mjs) imports this same file, so both sides
// always agree. "UBER *TRIP 8005", "Uber Trip" and "uber trip" all become "uber trip"; "The Home Depot #4512"
// becomes "home depot"; "Barnes & Noble" and "Barnes and Noble" both become "barnes and noble".
// Keep this file free of imports and TypeScript-only syntax: Node loads it directly.
const PROCESSOR_PREFIX = /^(sq|tst|sp|pp|paypal|py|ic|in|gglpay|bt|cke|clk|fs|pos|dd|lr|pmt)\s*\*\s*/
const FILLER = new Set(['inc', 'llc', 'ltd', 'corp', 'corporation', 'co', 'com', 'net', 'org', 'the', 'www'])

export function normalizeMerchantName(name: string): string {
  const plain = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(PROCESSOR_PREFIX, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z]+/g, ' ')
  return plain
    .split(' ')
    .filter((w) => w && !FILLER.has(w))
    .join(' ')
}

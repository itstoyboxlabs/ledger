// After a deploy: tells Bing (and ChatGPT's search, which reads Bing's index) that the public pages changed.
// The key file is served at /{key}.txt; see https://www.indexnow.org.

const HOST = 'ledgerfinancialplanning.com'
const KEY = '37cabb5250b35c1d506b8645b17910c8'
const urls = [`https://${HOST}/`, `https://${HOST}/tutorial`]
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
})
console.log('IndexNow:', res.status, res.statusText)

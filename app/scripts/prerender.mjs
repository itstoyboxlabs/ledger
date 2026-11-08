// After `vite build`: writes the finished HTML for each page into dist/.
//   dist/index.html            the landing page, prerendered
//   dist/tutorial/index.html   the tutorial, prerendered
//   dist/app/index.html        an empty shell for the app (it has nothing to show before JavaScript runs)
import fs from 'node:fs'
import path from 'node:path'
import { createServer } from 'vite'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const server = await createServer({ mode: 'browser', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { renderMarketing } = await server.ssrLoadModule('/src/screens/marketing/prerender.tsx')
  const write = (file, html) => {
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
    fs.writeFileSync(path.join(dist, file), html)
  }
  for (const [route, file] of [['home', 'index.html'], ['tutorial', 'tutorial/index.html']]) {
    const { html, meta } = renderMarketing(route)
    const head = `<title>${esc(meta.title)}</title>\n    <meta name="description" content="${esc(meta.description)}" />\n    <meta property="og:title" content="${esc(meta.title)}" />\n    <meta property="og:description" content="${esc(meta.description)}" />${meta.head ? `\n    ${meta.head}` : ''}`
    write(file, template.replace(/<title>.*?<\/title>/, head).replace('<div id="root"></div>', `<div id="root">${html}</div>`))
  }
  write('app/index.html', template)
  console.log('prerendered: /, /tutorial, /app')
} finally {
  await server.close()
}

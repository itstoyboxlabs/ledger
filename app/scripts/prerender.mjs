// After `vite build`: writes the finished HTML for each page into dist/, plus the crawler files.
//   dist/index.html            the landing page, prerendered, with its SEO head
//   dist/tutorial/index.html   the tutorial, prerendered
//   dist/app/index.html        an empty shell for the app (noindex: it has nothing to show before you upload a file)
//   dist/sitemap.xml, robots.txt, llms.txt
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { createServer } from 'vite'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

// The marketing pages' CSS (plain CSS, about 16 kB minified) goes straight into the <head>, so the first paint
// needs only the HTML file. The script tag stays, for hydration and the tutorial player.
const marketingCss = fs
  .readFileSync(path.resolve('src/styles/marketing.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
// Fonts: preload the stylesheet without blocking the first paint
const asyncFonts = (html) =>
  html.replace(/<link href="(https:\/\/fonts\.googleapis\.com[^"]+)" rel="stylesheet">/, '<link rel="preload" as="style" href="$1" onload="this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1"></noscript>')

// the day the marketing pages last changed, from git, so the sitemap date means something
function lastModified() {
  try {
    return execSync('git log -1 --format=%cs -- src/screens/marketing', { encoding: 'utf8' }).trim() || today()
  } catch {
    return today()
  }
}
const today = () => new Date().toISOString().slice(0, 10)

const server = await createServer({ mode: 'browser', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { renderMarketing, renderSiteFiles } = await server.ssrLoadModule('/src/screens/marketing/prerender.tsx')
  const write = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
    fs.writeFileSync(path.join(dist, file), text)
  }
  for (const [route, file] of [['home', 'index.html'], ['tutorial', 'tutorial/index.html']]) {
    const { html, head } = renderMarketing(route)
    const page = template
      .replace(/<title>.*?<\/title>/, `${head}\n    <style>${marketingCss}</style>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    write(file, asyncFonts(page))
  }
  write('app/index.html', template.replace('<title>Ledger</title>', '<title>Ledger</title>\n    <meta name="robots" content="noindex" />'))
  for (const [file, text] of Object.entries(renderSiteFiles(lastModified()))) write(file, text)
  console.log('prerendered: /, /tutorial, /app, sitemap.xml, robots.txt, llms.txt')
} finally {
  await server.close()
}

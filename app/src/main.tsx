import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { detectMode } from '@/shared/utils/detectMode'
import { getData } from '@/shared/utils/getData'
import { applyData } from '@/shared/utils/applyData'
import type { MarketingRoute } from '@/screens/marketing/types/MarketingRoute'
import { routeFor } from '@/shared/utils/routeFor'
import { track } from '@/shared/utils/track'
import { installCrashTracking } from '@/shared/utils/installCrashTracking'

const rootEl = document.getElementById('root') as HTMLElement

// The landing page and the tutorial are prerendered at build time, so the browser hydrates the HTML that is
// already there instead of building it.
async function showMarketing(route: MarketingRoute) {
  // the build inlines marketing.css into the page; in dev the stylesheet is loaded here
  if (import.meta.env.DEV) await import('./styles/marketing.css')
  const { MarketingPage } = await import('@/screens/marketing/ui/MarketingPage')
  const page = (
    <StrictMode>
      <MarketingPage route={route} />
    </StrictMode>
  )
  if (rootEl.hasChildNodes()) hydrateRoot(rootEl, page)
  else createRoot(rootEl).render(page)
  await startAnalytics()
  countVisit()
}

// Vercel Analytics page views. It follows the address bar, so every app screen (/app/spending ...) counts as its own page.
async function startAnalytics() {
  const { inject } = await import('@vercel/analytics')
  inject()
}

// One anonymous count per browser per day, by state, on the public pages only. The server reads the state from
// the request and stores nothing else (see api/visit.js).
function countVisit() {
  if (import.meta.env.DEV) return
  try {
    const today = new Date().toISOString().slice(0, 10)
    if (localStorage.getItem('ledger:counted') === today) return
    localStorage.setItem('ledger:counted', today)
    navigator.sendBeacon('/api/visit')
  } catch {
    // counting is best effort
  }
}

// Pick the storage mode and load the transactions before the first render, so nothing in the app ever sees an
// unloaded data module.
async function showApp() {
  await import('./styles/index.css')
  const { default: Root } = await import('./Root')
  await detectMode()
  try {
    const data = await getData()
    if (data) applyData(data)
  } catch (e) {
    console.error('Could not load data', e)
  }
  createRoot(rootEl).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  )
  await startAnalytics()
  track('app_opened')
}

async function boot() {
  installCrashTracking()
  let route = routeFor(window.location.pathname)
  // On the dev server with your own data folder (local mode), the root opens the app, as it always has.
  if (route === 'home' && import.meta.env.DEV && (await detectMode()) === 'local') route = 'app'
  if (route === 'app') await showApp()
  else await showMarketing(route)
}
boot()

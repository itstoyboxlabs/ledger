import { AppRoute } from '@/shared/enums/AppRoute'
// Which screen a URL path shows: the landing page ('home'), the video tutorial ('tutorial') or the app ('app').
export function routeFor(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/tutorial' || path === '/tutorial.html') return AppRoute.tutorial
  if (path === '/app' || path.startsWith('/app/')) return AppRoute.app
  return AppRoute.home
}

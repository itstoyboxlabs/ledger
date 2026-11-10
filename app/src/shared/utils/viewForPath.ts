import { APP_VIEW_PATHS } from '@/shared/constants/APP_VIEW_PATHS'

// The screen an address shows, like 'actuals' for '/app/spending'. null when the address names no screen.
export function viewForPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '')
  return Object.keys(APP_VIEW_PATHS).find((v) => APP_VIEW_PATHS[v] === path) ?? null
}

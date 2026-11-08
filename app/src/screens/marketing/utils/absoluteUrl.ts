import { SITE_URL } from '@/screens/marketing/constants/SITE_URL'

// '/tutorial' -> 'https://.../tutorial', '/' -> 'https://.../'
export function absoluteUrl(path: string): string {
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`)
}

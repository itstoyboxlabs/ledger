import { getMerchants } from '@/shared/utils/getMerchants'

// merchant name -> domain comes from the data file's `merchants` map. Icons are
// pre-downloaded to app/public/icons/ by scripts/fetch-icons.sh. A missing file
// falls back to the letter avatar in the UI.
export function faviconUrl(name: string): string | null {
  const domain = getMerchants()[name]
  return domain ? `/icons/${domain}.png` : null
}

import { getMerchants } from '@/shared/utils/getMerchants'
import { isLocal } from '@/shared/utils/isLocal'
import { catalogDomainFor } from '@/shared/utils/catalogDomainFor'
import { ICON_BASE_URL } from '@/shared/constants/ICON_BASE_URL'

// The logo for a merchant, or null for the letter avatar.
// Local mode: the domain from the data file's `merchants` map, served from app/public/icons/ (downloaded by
// scripts/fetch-icons.sh). Browser mode (the hosted site): a logo from the shared catalog of common merchants,
// matched on that domain or on the merchant's name. The catalog loads after the first paint, so this returns
// null until it arrives.
export function faviconUrl(name: string): string | null {
  const domain = getMerchants()[name]?.trim().toLowerCase().replace(/^www\./, '')
  if (isLocal()) return domain ? `/icons/${domain}.png` : null
  const hit = catalogDomainFor(name, domain)
  return hit ? `${ICON_BASE_URL}/${hit}.png` : null
}

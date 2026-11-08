import { iconCatalogStore } from '@/shared/state/iconCatalogStore'
import { normalizeMerchantName } from '@/shared/utils/normalizeMerchantName'

// Which catalog logo fits a merchant. First the domain from the data file's `merchants` map, if the catalog has
// it. Then the merchant's name: the whole normalized name, then shorter and shorter leading word groups, so
// "Uber Eats Delivery" tries "uber eats delivery", "uber eats", then "uber". Null when nothing matches.
export function catalogDomainFor(name: string, domain?: string | null): string | null {
  const { domains, names } = iconCatalogStore.getState()
  if (!domains.size) return null
  if (domain && domains.has(domain)) return domain
  const words = normalizeMerchantName(name).split(' ').filter(Boolean)
  for (let n = words.length; n > 0; n--) {
    const hit = names[words.slice(0, n).join(' ')]
    if (hit && domains.has(hit)) return hit
  }
  return null
}

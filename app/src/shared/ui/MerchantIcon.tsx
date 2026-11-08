import { faviconUrl } from '@/shared/utils/faviconUrl'
import { useIconCatalog } from '@/shared/hooks/useIconCatalog'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/primitives/avatar'
import { cn } from '@/shared/utils/cn'

// company favicon with letter-avatar fallback (unknown merchant or failed load). On the hosted site the logo comes
// from the shared catalog, which loads after the first paint; useIconCatalog re-renders this when it arrives.
type MerchantIconProps = { name: string; size?: number; round?: boolean }

export function MerchantIcon({ name, size = 18, round: roundProp }: MerchantIconProps) {
  useIconCatalog()
  const url = faviconUrl(name)
  const round = roundProp ?? size >= 26
  return (
    <Avatar
      className={cn('bg-[var(--surface-2)]', !round && 'rounded-[5px] after:rounded-[5px]')}
      style={{ width: size, height: size }}
    >
      {url && <AvatarImage src={url} alt="" loading="lazy" decoding="async" className={round ? '' : 'rounded-[5px]'} />}
      <AvatarFallback
        delayMs={url ? 400 : 0}
        className={cn(
          'bg-[var(--surface-3)] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--ring)] ring-inset',
          round ? 'text-[13px]' : 'rounded-[5px] text-[10px]',
        )}
      >
        {name.replace(/^The /, '').charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

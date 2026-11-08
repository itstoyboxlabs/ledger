import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'

// a small pill badge that sits at the top-right corner of a field — used for the
// "Auto"/"Find" buttons that swap or compute a value. ALWAYS absolutely positioned
// over a `relative` wrapper so it can never add height to the label row above it and
// throw off alignment against sibling fields (a bug this app has hit more than
// once — see the FieldGroup story in DOCS.md if it recurs).
type FieldBadgeProps = {
  label: string
  active: boolean
  onClick: () => void
  title?: string
}

export function FieldBadge({ label, active, onClick, title }: FieldBadgeProps) {
  const button = (
    <Button variant={active ? 'soft' : 'outline'} aria-pressed={active}
      onClick={onClick}
      className={cn('absolute top-0 right-0 h-auto rounded px-1 py-0.5 text-[9px]', !active && 'text-[var(--text-muted)] hover:text-white')}
    >
      {label}
    </Button>
  )
  if (!title) return button
  return (
    <UITooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">{title}</TooltipContent>
    </UITooltip>
  )
}

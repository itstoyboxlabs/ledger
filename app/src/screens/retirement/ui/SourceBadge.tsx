import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/shared/ui/primitives/dropdown-menu'
import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { Check } from 'lucide-react'

// A small pill at the top-right corner of a field, sized like the other field badges, that
// opens a list of where the field's numbers come from (a preset, today's, or typed). Absolutely
// positioned over a `relative` wrapper, so it never moves the field below it.
type SourceBadgeProps = {
  // what the picker picks, shown at the top of the list, like "Take-home preset"
  title: string
  // the period it belongs to, like "Now", for screen readers
  owner: string
  value: string
  // the short text on the pill
  short: string
  options: { value: string; label: string }[]
  onPick: (value: string) => void
}

export function SourceBadge({ title, owner, value, short, options, onPick }: SourceBadgeProps) {
  const typed = value === 'typed'
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={typed ? 'outline' : 'soft'} aria-label={`${title} for ${owner}: ${short}`}
          className={cn('absolute top-0 right-0 h-auto max-w-[60%] truncate rounded px-1 py-0.5 text-[9px]', typed && 'text-[var(--text-muted)] hover:text-white')}
        >
          {short}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl">
        <DropdownMenuLabel className="text-[11px] font-normal text-[var(--text-muted)]">{title}</DropdownMenuLabel>
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onSelect={() => onPick(o.value)} className="gap-2 text-[13px]">
            <Check className={cn('size-3.5 shrink-0', o.value === value ? 'opacity-100' : 'opacity-0')} />
            <span className="truncate">{o.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

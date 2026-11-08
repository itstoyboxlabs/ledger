import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/shared/ui/primitives/dropdown-menu'
import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { Icon } from '@/shared/ui/Icon'
import type { DropdownOption } from '@/shared/types/DropdownOption'

/* ---------- small ui atoms ---------- */

// shadcn-style dropdown. Single-select (value/onChange) or multi-select (values/onToggle).
type DropdownProps = {
  label: string
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  values?: string[]
  onToggle?: (value: string) => void
  icon?: string
  hideLabel?: boolean
  className?: string
}

export function Dropdown({ label, options, value, onChange, values, onToggle, icon, hideLabel, className }: DropdownProps) {
  const multi = !!values
  const display = multi
    ? values.length === options.length
      ? `All ${label.toLowerCase()}s`
      : values.length === 0
        ? `No ${label.toLowerCase()}`
        : options.filter((o) => values.includes(o.value)).map((o) => o.label).join(', ')
    : options.find((o) => o.value === value)?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn('group gap-2.5 rounded-lg font-normal', hideLabel ? 'h-10 px-3.5' : 'h-9 px-3', className)}>
          {icon && <Icon name={icon} size={16} className="text-[var(--text-secondary)]" />}
          {!hideLabel && <span className="text-[var(--text-muted)]">{label}</span>}
          <span className="whitespace-nowrap font-medium">{display}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-[var(--text-muted)] transition-transform group-data-[state=open]:rotate-180">
            <path d="M1 3.5 L5 7.5 L9 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[340px] min-w-[190px] rounded-xl">
        {options.map((o) =>
          multi ? (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={values.includes(o.value)}
              onCheckedChange={() => onToggle?.(o.value)}
              onSelect={(e) => e.preventDefault()}
              className="text-[13px]"
            >
              {o.badge}
              {o.label}
            </DropdownMenuCheckboxItem>
          ) : (
            <DropdownMenuItem key={o.value} onSelect={() => onChange?.(o.value)} className="justify-between gap-3 text-[13px]">
              <span className="flex items-center gap-2">
                {o.badge}
                <span className={value === o.value ? 'font-medium' : 'text-[var(--text-secondary)]'}>{o.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {value === o.value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0">
                    <path d="M2 6.5 L4.8 9.2 L10 3.2" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {/* an optional control at the right end of the row, e.g. a link out */}
                {o.trailing?.()}
              </span>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

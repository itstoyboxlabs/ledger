import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'
import { Button } from '@/shared/ui/primitives/button'

// the info badge on the two Left over KPIs: points at "What to do with what is left"
export function LeftoverBadge() {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs"
          onClick={() => document.getElementById('leftover-plan')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          aria-label="What happens to this money"
          className="h-6 w-6 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 hover:text-[var(--accent)]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[260px]">
        Scroll down to the bottom of this page to choose what happens to this money, like saving part of it or moving it to a row like Unexpected.
      </TooltipContent>
    </UITooltip>
  )
}

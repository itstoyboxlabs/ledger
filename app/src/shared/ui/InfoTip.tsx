import type { ReactNode } from 'react'
import { Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/primitives/tooltip'

// column header with a hover ⓘ tooltip — opens DOWNWARD (headers sit at the top
// of scroll containers, so an upward tooltip would be clipped by the overflow)
// (i) icon with a shadcn Tooltip
type InfoTipProps = { tip: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; size?: number }

export function InfoTip({ tip, side = 'top', size = 13 }: InfoTipProps) {
  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex cursor-help text-[var(--text-muted)] outline-none hover:text-white">
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
          </svg>
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>{tip}</TooltipContent>
    </UITooltip>
  )
}

import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/shared/ui/primitives/button'
import { cn } from '@/shared/utils/cn'
import { GuideToc } from '@/screens/guide/ui/GuideToc'
import type { TocEntry } from '@/screens/guide/types/TocEntry'

type GuideMobileTocProps = {
  toc: readonly TocEntry[]
  active: string | null
  onNavigate: (id: string) => void
}

// Narrow screens: the table of contents folds into one "On this page" button at the top of the
// guide. Picking a heading closes it again.
export function GuideMobileToc({ toc, active, onNavigate }: GuideMobileTocProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return (
    <div className="mb-8 rounded-xl bg-[var(--surface-1)] ring-1 ring-[var(--ring)]">
      <Button
        variant="ghost"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="h-11 w-full justify-between rounded-xl px-4 text-[14px] font-semibold"
      >
        On this page
        <ChevronDown className={cn('size-4 transition-transform motion-reduce:transition-none', open && 'rotate-180')} aria-hidden />
      </Button>
      {open && (
        <div id={panelId} className="px-4 pb-4 pt-1">
          <GuideToc toc={toc} active={active} showTitle={false} onNavigate={(id) => {
            // close first, so the scroll lands where the heading ends up once the list is gone
            flushSync(() => setOpen(false))
            onNavigate(id)
          }} />
        </div>
      )}
    </div>
  )
}

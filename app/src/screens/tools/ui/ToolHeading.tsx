import { useState, type ReactNode } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives/popover'
import { Icon } from '@/shared/ui/Icon'
import { ToolVideoModal } from '@/screens/tools/ui/ToolVideoModal'

type ToolHeadingProps = {
  id: string
  title: string
  // what the tool is and how to use it, shown in the info popup instead of on the card
  children: ReactNode
  // sits at the right of the heading, like a preset bar
  action?: ReactNode
}

const BUTTON =
  'inline-flex size-6 items-center justify-center rounded-lg text-[var(--text-muted)] outline-none transition-colors hover:bg-[var(--surface-2)] hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--ring)]'

// The top of a tool's card: its name, an info button that opens what the tool does, and a video button.
export function ToolHeading({ id, title, children, action }: ToolHeadingProps) {
  const [video, setVideo] = useState(false)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <h2 className="mr-1 text-[15px] font-semibold">{title}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={BUTTON} aria-label={`About ${title}`}>
              <Icon name="info" size={15} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 text-[12px] leading-relaxed text-[var(--text-secondary)]">
            {children}
          </PopoverContent>
        </Popover>
        <button type="button" className={BUTTON} aria-label={`Watch the ${title} video`} onClick={() => setVideo(true)}>
          <Icon name="play-circle" size={15} />
        </button>
      </div>
      {action}
      {video && <ToolVideoModal id={id} title={title} onClose={() => setVideo(false)} />}
    </div>
  )
}

import { Link as LinkIcon } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type GuideHeadingProps = {
  level: 2 | 3
  id: string
  title: string
  onAnchor: (id: string) => void
}

// A section (h2) or subsection (h3) heading with its id, plus a small link to it that shows on
// hover or keyboard focus. The heading takes focus when the table of contents jumps to it.
export function GuideHeading({ level, id, title, onAnchor }: GuideHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3'
  return (
    <div className={cn('group flex items-center gap-2', level === 2 ? 'border-b border-[var(--grid)] pb-2.5' : 'mt-9')}>
      <Tag
        id={id}
        tabIndex={-1}
        className={cn(
          'scroll-mt-6 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--page)]',
          level === 2 ? 'text-[24px] font-bold tracking-tight' : 'text-[17px] font-semibold',
        )}
      >
        {title}
      </Tag>
      <a
        href={`#${id}`}
        aria-label={`Link to ${title}`}
        onClick={(e) => { e.preventDefault(); onAnchor(id) }}
        className="rounded-md p-1 text-[var(--text-muted)] opacity-0 outline-none transition-opacity hover:text-[var(--text-primary)] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--accent)] group-hover:opacity-100 motion-reduce:transition-none"
      >
        <LinkIcon className="size-4" aria-hidden />
      </a>
    </div>
  )
}

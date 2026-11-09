import { cn } from '@/shared/utils/cn'
import type { TocEntry } from '@/screens/guide/types/TocEntry'

type GuideTocProps = {
  toc: readonly TocEntry[]
  active: string | null
  onNavigate: (id: string) => void
  // hides the "On this page" title when the disclosure button already says it
  showTitle?: boolean
}

// "On this page": sections with their subsections nested under them. The heading being read is
// marked (aria-current) and its section stays lit too.
export function GuideToc({ toc, active, onNavigate, showTitle = true }: GuideTocProps) {
  const link = (t: TocEntry, depth: number, lit: boolean) => (
    <a
      href={`#${t.id}`}
      aria-current={active === t.id ? 'location' : undefined}
      onClick={(e) => { e.preventDefault(); onNavigate(t.id) }}
      className={cn(
        '-ml-px block border-l py-1 leading-snug outline-none transition-colors hover:text-[var(--text-primary)] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none',
        depth === 0 ? 'pl-3 text-[13px]' : 'pl-6 text-[12.5px]',
        active === t.id
          ? 'border-[var(--accent)] font-medium text-[var(--text-primary)]'
          : lit && depth === 0
            ? 'border-transparent text-[var(--text-primary)]'
            : 'border-transparent text-[var(--text-muted)]',
      )}
    >
      {t.title}
    </a>
  )
  return (
    <nav aria-label="On this page">
      {showTitle && <p className="mb-3 text-[12px] font-semibold text-[var(--text-secondary)]">On this page</p>}
      <ul className="flex flex-col gap-1 border-l border-[var(--grid)]">
        {toc.map((s) => {
          const lit = active === s.id || s.children.some((c) => c.id === active)
          return (
            <li key={s.id}>
              {link(s, 0, lit)}
              {s.children.length > 0 && (
                <ul className="flex flex-col">
                  {s.children.map((c) => <li key={c.id}>{link(c, 1, lit)}</li>)}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

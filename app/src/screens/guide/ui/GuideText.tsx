import { Fragment } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/primitives/button'
import type { GuideInline } from '@/screens/guide/types/GuideInline'

type GuideTextProps = {
  parts: readonly GuideInline[]
  // switches the app to another tab, without a reload
  goTo: (view: string) => void
  // scrolls to a heading on this page
  onAnchor: (id: string) => void
}

const LINK = 'font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 underline-offset-4 hover:decoration-[var(--accent)] rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'

// A run of guide text. App labels are bold, tab names switch tabs, anchors scroll this page and
// outside links open in a new tab.
export function GuideText({ parts, goTo, onAnchor }: GuideTextProps) {
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <Fragment key={i}>{p}</Fragment>
        if ('label' in p) return <strong key={i} className="font-semibold text-[var(--text-primary)]">{p.label}</strong>
        if ('code' in p) return <code key={i} className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--text-primary)] ring-1 ring-[var(--ring)]">{p.code}</code>
        if ('tab' in p) {
          return (
            <Button key={i} variant="link" onClick={() => goTo(p.tab)}
              className={`inline h-auto whitespace-normal p-0 align-baseline text-[length:inherit] leading-[inherit] ${LINK}`}
            >
              {p.text}
            </Button>
          )
        }
        if ('anchor' in p) {
          return (
            <a key={i} href={`#${p.anchor}`} className={LINK} onClick={(e) => { e.preventDefault(); onAnchor(p.anchor) }}>
              {p.text}
            </a>
          )
        }
        return (
          <a key={i} href={p.href} target="_blank" rel="noreferrer" className={LINK}>
            {p.text}
            <ExternalLink className="ml-0.5 inline size-3 align-[-1px]" aria-hidden />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )
      })}
    </>
  )
}

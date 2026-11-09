import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'
import { Button } from '@/shared/ui/primitives/button'
import { useTutorialAck } from '@/shared/hooks/useTutorialAck'
import { isLocal } from '@/shared/utils/isLocal'
import { TUTORIAL_URL } from '@/shared/constants/TUTORIAL_URL'

// A first-run pointer over the Tutorial link, with a callout that asks the person to watch the tutorials. Wrap the
// link in it. It shows in browser mode until `ledger:tutorialAck` is set. "Okay" and "Open the tutorials" set it;
// Escape only hides it until the next page load. It is not a modal: nothing is dimmed and the rest of the app works.
// On wide screens the callout opens to the right of the sidebar; otherwise it opens above the link, kept inside the
// drawer. Both are placed from the measured link, and hidden for the first frame until they are. The arrow bounces unless the person prefers reduced motion (see `.nudge-arrow`).
export function TutorialNudge({ children }: { children: ReactNode }) {
  const { acknowledged, acknowledge } = useTutorialAck()
  const [hidden, setHidden] = useState(false)
  const wrap = useRef<HTMLSpanElement>(null)
  const [side, setSide] = useState<CSSProperties | null>(null)
  const id = useId()
  const open = !acknowledged && !hidden && !isLocal()

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const el = wrap.current
      if (!el) return
      const me = el.getBoundingClientRect()
      const aside = el.closest('aside')
      if (aside && window.matchMedia?.('(min-width: 1024px)').matches) {
        // wide: to the right of the sidebar, bottom edges level
        return setSide({ left: aside.getBoundingClientRect().right - me.left + 14, bottom: 0 })
      }
      // narrow: above the link, kept inside the drawer (or the window) so nothing is cut off
      const box = el.closest('[data-slot="sheet-content"]')?.getBoundingClientRect()
      const lo = (box?.left ?? 0) + 12
      const hi = (box?.right ?? window.innerWidth) - 12
      const w = Math.min(256, hi - lo)
      const x = Math.max(lo, Math.min(me.left + me.width / 2 - w / 2, hi - w))
      setSide({ left: x - me.left, bottom: 'calc(100% + 2.25rem)', width: w })
    }
    place()
    // the menu drawer slides in, so keep measuring for a moment until it has settled
    const t0 = performance.now()
    let raf = requestAnimationFrame(function tick() {
      place()
      if (performance.now() - t0 < 700) raf = requestAnimationFrame(tick)
    })
    window.addEventListener('resize', place)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', place) }
  }, [open])

  // after the callout goes away, keyboard focus goes back to the link instead of the page start
  const refocus = () => queueMicrotask(() => wrap.current?.querySelector<HTMLElement>('a, button')?.focus())
  useEffect(() => {
    if (!open || !wrap.current) return
    const link = wrap.current.querySelector('a')
    link?.addEventListener('click', acknowledge)
    return () => link?.removeEventListener('click', acknowledge)
  })
  const done = () => { acknowledge(); refocus() }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) { setHidden(true); refocus() }
  }

  return (
    <span ref={wrap} className="relative inline-flex" onKeyDown={onKeyDown}>
      {children}
      {open && (
        <>
          <span aria-hidden="true" className="nudge-arrow pointer-events-none absolute -top-7 left-1/2 -ml-[11px] text-[var(--accent)]">
            <ArrowDown size={22} strokeWidth={2.75} />
          </span>
          <div
            role="dialog"
            aria-modal="false"
            aria-labelledby={`${id}-t`}
            aria-describedby={`${id}-d`}
            style={side ?? { visibility: 'hidden' }}
            className="absolute z-50 w-64 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[var(--surface-3)] p-4 shadow-xl"
          >
            <h2 id={`${id}-t`} className="text-[15px] font-semibold text-white">Watch the tutorials first</h2>
            <p id={`${id}-d`} className="mt-1.5 whitespace-normal text-left text-[13px] font-normal leading-snug text-[var(--text-secondary)]">
              We recommend watching the short tutorial videos before you use Ledger. They show how each tab works and how the pieces connect.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <Button size="sm" onClick={done}>Okay</Button>
              <a
                href={TUTORIAL_URL}
                target="_blank"
                rel="noreferrer"
                onClick={acknowledge}
                className="rounded text-[13px] text-[var(--accent)] underline underline-offset-4 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                Open the tutorials
              </a>
            </div>
          </div>
        </>
      )}
    </span>
  )
}

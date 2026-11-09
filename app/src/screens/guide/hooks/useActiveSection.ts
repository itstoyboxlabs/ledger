import { useEffect, useState } from 'react'

// The heading the reader is on, for the "On this page" highlight. A heading counts as reached once it
// is in the top 15% of the window or above it, and the active one is the last heading reached
// (the first one before any). An IntersectionObserver reports each heading crossing those lines, so
// nothing runs on every scroll. setActive marks a heading right away after a click.
export function useActiveSection(ids: readonly string[]): [string | null, (id: string) => void] {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  const key = ids.join(' ')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const list = key ? key.split(' ') : []
    const reached = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // inside the band, or gone off the top of the window
          reached.set(e.target.id, e.isIntersecting || e.boundingClientRect.top < (e.rootBounds?.top ?? 0))
        }
        const last = [...list].reverse().find((id) => reached.get(id))
        setActive(last ?? list[0] ?? null)
      },
      { rootMargin: '0px 0px -85% 0px', threshold: 0 },
    )
    for (const id of list) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [key])
  return [active, setActive]
}

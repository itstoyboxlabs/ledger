// Scrolls a heading on the page to the top and moves keyboard focus to it, so the next Tab
// continues from there. Smooth unless the person asked for less motion. False when it is missing.
export function scrollToHeading(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
  return true
}

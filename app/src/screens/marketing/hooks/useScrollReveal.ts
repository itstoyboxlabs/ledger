import { useEffect } from 'react'

// Fades things up as they scroll into view (children one after another) and starts the chart animations.
// The page is fully visible until this runs, so the prerendered HTML reads fine without JavaScript.
// Marks elements with data-in and cards with data-drawn; the CSS in styles/marketing.css does the rest.
export function useScrollReveal(): void {
  useEffect(() => {
    const root = document.documentElement
    const reveal = document.querySelectorAll('.reveal,.reveal-kids')
    const cards = document.querySelectorAll('.card')
    document.querySelectorAll('.reveal-kids').forEach((group) => {
      ;[...group.children].forEach((child, i) => (child as HTMLElement).style.setProperty('--d', (i * 0.09).toFixed(2) + 's'))
    })

    if (typeof IntersectionObserver === 'undefined') {
      reveal.forEach((el) => el.setAttribute('data-in', ''))
      cards.forEach((el) => el.setAttribute('data-drawn', ''))
      return undefined
    }

    root.classList.add('js')
    const show = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.setAttribute('data-in', '')
          show.unobserve(e.target)
        }),
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    const draw = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const card = e.target
          card.setAttribute('data-drawn', '')
          draw.unobserve(card)
          const line = card.querySelector<SVGPathElement>('#curve path[fill="none"]')
          if (line && typeof line.getTotalLength === 'function') {
            const length = line.getTotalLength()
            line.style.strokeDasharray = String(length)
            line.style.strokeDashoffset = String(length)
            line.getBoundingClientRect()
            line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.3,.6,.2,1)'
            line.style.strokeDashoffset = '0'
          }
        }),
      { threshold: 0.3 },
    )
    reveal.forEach((el) => show.observe(el))
    cards.forEach((el) => draw.observe(el))

    return () => {
      show.disconnect()
      draw.disconnect()
      root.classList.remove('js')
    }
  }, [])
}

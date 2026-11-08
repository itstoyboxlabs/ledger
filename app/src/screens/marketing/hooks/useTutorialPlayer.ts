import { useCallback, useEffect, useRef, useState } from 'react'

// The tutorial's current chapter. Choosing one plays it, and a finished chapter starts the next.
// The chapter is kept in the URL hash (#chapter-3) so a link can open straight to it.
export function useTutorialPlayer(count: number) {
  const [index, setIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const autoplay = useRef(false)

  // Open the chapter named in the hash. This runs after hydration so the server HTML always shows chapter 1.
  useEffect(() => {
    const m = window.location.hash.match(/chapter-(\d+)/)
    if (m) setIndex(Math.min(Math.max(+m[1] - 1, 0), count - 1))
  }, [count])

  useEffect(() => {
    window.history.replaceState(null, '', `#chapter-${index + 1}`)
    if (autoplay.current) {
      autoplay.current = false
      videoRef.current?.play?.()?.catch?.(() => {})
    }
  }, [index])

  const select = useCallback((i: number) => {
    autoplay.current = true
    setIndex(i)
  }, [])

  const onEnded = useCallback(() => {
    if (index < count - 1) select(index + 1)
  }, [index, count, select])

  return { index, select, onEnded, videoRef }
}

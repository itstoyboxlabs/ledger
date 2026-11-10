import { useCallback, useEffect, useState } from 'react'
import { usePersistedState } from '@/shared/hooks/usePersistedState'
import { pathForView } from '@/shared/utils/pathForView'
import { viewForPath } from '@/shared/utils/viewForPath'
import { track } from '@/shared/utils/track'

// Which app screen is open, kept in the address bar (/app/spending, /app/retirement ...) so every screen can be
// linked to, refreshed and counted as its own page. The last screen is also saved, so /app opens where you left off.
export function useViewRoute(validate: (v: unknown) => boolean): [string, (view: string) => void] {
  const [saved, setSaved] = usePersistedState('view', 'actuals', validate)
  const [view, setViewState] = useState(() => viewForPath(window.location.pathname) ?? saved)

  // an address that names no screen (/app) is rewritten to the one being shown
  useEffect(() => {
    if (viewForPath(window.location.pathname) !== view) window.history.replaceState(null, '', pathForView(view))
    // only on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the back and forward buttons
  useEffect(() => {
    const onPop = () => {
      const next = viewForPath(window.location.pathname)
      if (next) {
        setViewState(next)
        setSaved(next)
      } else {
        // back onto an address that is no screen (like /app/upload after loading data): stay on the open screen
        window.history.replaceState(null, '', pathForView(view))
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [setSaved, view])

  useEffect(() => track('screen_opened'), [view])

  const setView = useCallback(
    (next: string) => {
      if (window.location.pathname !== pathForView(next)) window.history.pushState(null, '', pathForView(next))
      setViewState(next)
      setSaved(next)
    },
    [setSaved],
  )
  return [view, setView]
}

// Starts downloading lazy chunks while the browser is idle, so switching tabs never waits on the network.
// Each loader is a dynamic import that the app already uses with React.lazy, so the module is cached when the
// tab opens and the page never blanks while a chunk loads. A failed download is ignored: the tab loads it later.
export function prefetchChunks(loaders: Array<() => Promise<unknown>>): void {
  const idle = (run: () => void) => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 3000 })
    else setTimeout(run, 1500)
  }
  const next = (i: number) => {
    if (i >= loaders.length) return
    idle(() => {
      loaders[i]()
        .catch(() => undefined)
        .finally(() => next(i + 1))
    })
  }
  next(0)
}

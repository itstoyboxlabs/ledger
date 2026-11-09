import { lazy, type ComponentType } from 'react'

// React.lazy for a module that exports its component by name. Usage:
//   const BudgetView = lazyNamed(() => import('./BudgetView'), 'BudgetView')
// It also adds `preload()`. Once a module has been downloaded (by preload() or by an earlier render) the component
// renders straight away, so opening a tab or chart never flashes the Suspense fallback. Before that, React.lazy
// shows the fallback while the chunk downloads.
export function lazyNamed<K extends string, P extends object>(loader: () => Promise<Record<K, ComponentType<P>>>, name: K) {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<void> | null = null
  const preload = () => {
    pending ??= loader().then(
      (m) => {
        loaded = m[name]
      },
      () => {
        pending = null // try again on the next visit
      },
    )
    return pending
  }
  const Lazy = lazy(() => preload().then(() => ({ default: loaded as ComponentType<P> })))
  const Component = (props: P) => {
    const Ready = loaded
    return Ready ? <Ready {...props} /> : <Lazy {...(props as P & React.JSX.IntrinsicAttributes)} />
  }
  Component.preload = preload
  return Component
}

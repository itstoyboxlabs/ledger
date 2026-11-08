import { lazy, type ComponentType } from 'react'

// React.lazy for a module that exports its component by name. Usage:
//   const BudgetView = lazyNamed(() => import('./BudgetView'), 'BudgetView')
export function lazyNamed<K extends string, P extends object>(loader: () => Promise<Record<K, ComponentType<P>>>, name: K) {
  return lazy(() => loader().then((m) => ({ default: m[name] })))
}

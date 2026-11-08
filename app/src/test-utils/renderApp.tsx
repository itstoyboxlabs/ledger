import { render, type RenderOptions } from '@testing-library/react'
import { TooltipProvider } from '@/shared/ui/primitives/tooltip'
import { DataContext } from '@/shared/state/DataContext'
import type { DataContextValue } from '@/shared/types/DataContextValue'
import type { ReactElement } from 'react'

// Renders a component the way the app does: inside the tooltip provider and the data context.
// Pass `context` to override the stubbed import and notify functions.
export function renderApp(ui: ReactElement, { context, ...options }: RenderOptions & { context?: Partial<DataContextValue> } = {}) {
  const value: DataContextValue = { mode: 'browser', notify: () => {}, importFiles: async () => {}, importSample: async () => {}, ...context }
  return render(
    <DataContext.Provider value={value}>
      <TooltipProvider>{ui}</TooltipProvider>
    </DataContext.Provider>,
    options,
  )
}

import { track } from '@/shared/utils/track'

// Reports a crash (an uncaught error or a rejected promise nobody handled) with its scrubbed message and the route.
// React reports errors thrown while rendering through window "error" too, so this covers them as well.
export function installCrashTracking(): void {
  window.addEventListener('error', (e) => track('crash', e.message || 'Script error'))
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason
    track('crash', r instanceof Error ? `${r.name}: ${r.message}` : typeof r === 'string' ? r : 'Unhandled rejection')
  })
}

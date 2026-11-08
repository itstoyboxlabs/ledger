import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'

// jsdom has no ResizeObserver, which the Radix tooltips and dropdowns use when they open. A do-nothing stand-in
// keeps those components from throwing in tests.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

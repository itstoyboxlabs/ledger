import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { iconCatalogStore } from '@/shared/state/iconCatalogStore'

// jsdom has no ResizeObserver, which the Radix tooltips and dropdowns use when they open. A do-nothing stand-in
// keeps those components from throwing in tests.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// Unit tests never download the shared logo catalog: it starts as "failed", so components show letter avatars and
// make no network request. The catalog's own tests set the status back to "idle".
beforeEach(() => iconCatalogStore.setState({ status: 'failed', domains: new Set(), names: {} }))

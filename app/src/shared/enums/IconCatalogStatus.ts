const IconCatalogStatus = {
  idle: 'idle',
  queued: 'queued',
  loading: 'loading',
  ready: 'ready',
  failed: 'failed',
} as const

type IconCatalogStatus = (typeof IconCatalogStatus)[keyof typeof IconCatalogStatus]

export { IconCatalogStatus }

const StorageMode = {
  local: 'local',
  browser: 'browser',
} as const

type StorageMode = (typeof StorageMode)[keyof typeof StorageMode]

export { StorageMode }

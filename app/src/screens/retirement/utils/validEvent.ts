export const validEvent = (e: unknown): e is Record<string, unknown> & { id: string } =>
  !!e && typeof e === 'object' && typeof (e as { id?: unknown }).id === 'string'

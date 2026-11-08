export const validToolIds = (v: unknown): v is string[] => Array.isArray(v) && v.every((id) => typeof id === 'string')

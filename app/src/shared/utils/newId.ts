export const newId = (p: string): string => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

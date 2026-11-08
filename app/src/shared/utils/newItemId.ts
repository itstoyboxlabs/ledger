export const newItemId = (): string => `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

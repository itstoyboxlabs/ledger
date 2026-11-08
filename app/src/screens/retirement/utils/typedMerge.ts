// defaults overlaid with the keys of `raw` that exist in defaults and have the same typeof
export const typedMerge = <T extends object>(defaults: T, raw: unknown): T => ({
  ...defaults,
  ...Object.fromEntries(
    Object.entries((raw || {}) as object).filter(([k, v]) => k in defaults && typeof v === typeof (defaults as Record<string, unknown>)[k]),
  ),
})

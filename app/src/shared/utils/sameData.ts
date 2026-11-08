// One dropdown of named presets, shared by Budget, Rent scenarios, Balances and
// Retirement, plus the save-name and delete-confirm modals. The trigger shows the active
// preset (or "Presets"), with a dot when the current values drifted from it. `scope`
// names the page so each remembers its own active preset.
export const sameData = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b)

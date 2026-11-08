// Does a row get a meter? `trackInLog` on the row wins. Without it, rows with no billing
// day get one (that spending is the kind worth watching) and rows with a day do not,
// unless something is already logged against them this month.
export const logTracked = (r: { trackInLog?: boolean | null; day?: number | null }, hasEntries: boolean): boolean => r.trackInLog ?? (r.day == null || hasEntries)

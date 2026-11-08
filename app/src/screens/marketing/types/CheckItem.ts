// A line in a check list: plain text, or { bold, rest } to bold the start.
export type CheckItem = string | { bold: string; rest: string }

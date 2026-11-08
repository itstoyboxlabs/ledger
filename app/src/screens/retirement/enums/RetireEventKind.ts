const RetireEventKind = {
  in: 'in',
  out: 'out',
  debt: 'debt',
} as const

type RetireEventKind = (typeof RetireEventKind)[keyof typeof RetireEventKind]

export { RetireEventKind }

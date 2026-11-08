const RetireRepeat = {
  once: 'once',
  month: 'month',
  year: 'year',
  twoYear: '2year',
} as const

type RetireRepeat = (typeof RetireRepeat)[keyof typeof RetireRepeat]

export { RetireRepeat }

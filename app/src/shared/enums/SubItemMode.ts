const SubItemMode = {
  month: 'month',
  week: 'week',
} as const

type SubItemMode = (typeof SubItemMode)[keyof typeof SubItemMode]

export { SubItemMode }

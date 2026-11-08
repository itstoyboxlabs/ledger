const SortDirection = {
  asc: 'asc',
  desc: 'desc',
} as const

type SortDirection = (typeof SortDirection)[keyof typeof SortDirection]

export { SortDirection }

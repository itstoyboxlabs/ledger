// Where a pay period gets its numbers: today's Take-home tool or Budget, a saved preset
// of one of them, or numbers typed on the period.
const PaySource = {
  today: 'today',
  preset: 'preset',
  typed: 'typed',
} as const

type PaySource = (typeof PaySource)[keyof typeof PaySource]

export { PaySource }

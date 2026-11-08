const AccountType = {
  checking: 'checking',
  savings: 'savings',
  card: 'card',
} as const

type AccountType = (typeof AccountType)[keyof typeof AccountType]

export { AccountType }

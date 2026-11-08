// How an account is taxed. `regular` is ordinary savings: you already paid tax on it and
// only its gains are taxed. `pretax` is a traditional 401k or IRA: never taxed going in,
// so every dollar out is taxed as income. `roth` was taxed going in and comes out tax free.
const AssetKind = {
  regular: 'regular',
  pretax: 'pretax',
  roth: 'roth',
} as const

type AssetKind = (typeof AssetKind)[keyof typeof AssetKind]

export { AssetKind }

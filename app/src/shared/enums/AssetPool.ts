const AssetPool = {
  savings: 'savings',
  k401: '401k',
} as const

type AssetPool = (typeof AssetPool)[keyof typeof AssetPool]

export { AssetPool }

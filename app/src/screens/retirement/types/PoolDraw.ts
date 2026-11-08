// One year's draw from the retirement pools to cover what savings could not.
// `pretax` and `roth` are what leaves each pool, `tax` is the income tax on the pre-tax
// part and `short` is what is still missing once both are empty.
export interface PoolDraw {
  pretax: number
  roth: number
  tax: number
  short: number
}

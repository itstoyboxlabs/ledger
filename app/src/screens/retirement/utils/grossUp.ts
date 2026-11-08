// The gross amount G to take out of a pre-tax account so that G minus the tax on G is `net`.
// The tax is progressive, so there is no closed form: this bisects. G minus tax(G) rises
// with G as long as no bracket is 100%, so the answer is unique. `max` caps the search at
// what the account holds.
export function grossUp(net: number, tax: (gross: number) => number, max = Infinity): number {
  if (net <= 0) return 0
  // under the standard deduction nothing is owed, so take out exactly what is needed
  if (net <= max && tax(net) === 0) return net
  let lo = net
  let hi = Math.min(max, net * 2)
  // widen until hi is enough (a top rate near 50% needs more than double)
  while (hi < max && hi - tax(hi) < net) hi = Math.min(max, hi * 2)
  if (hi - tax(hi) <= net) return hi
  for (let i = 0; i < 100 && hi - lo > 0.005; i++) {
    const mid = (lo + hi) / 2
    if (mid - tax(mid) < net) lo = mid
    else hi = mid
  }
  return hi
}

// What a "Pay off a debt" event takes out of savings, `months` after today (12 for every year
// from your age now to the event age). The rule, kept in step with the starting hole: in
// Retirement a debt's balance comes out of savings once, either at the start (the hole) or at the
// event, and the monthly payment until then is a Budget expense that covers the interest. So the
// event pays today's balance. When the payment does not cover the interest the unpaid interest
// piles onto the debt, and the event pays that bigger balance instead. With no APR this is
// always today's balance, exactly as before.
export function debtEventAmount(balance: number, monthlyPayment: number, apr: number, months: number): number {
  if (balance <= 0) return 0
  const r = apr / 100 / 12
  const p = Math.max(0, Number(monthlyPayment) || 0)
  const n = Math.max(0, months)
  if (!(r > 0) || p >= r * balance || n === 0) return balance
  // the balance after n months of interest at r and payments of p
  const grow = (1 + r) ** n
  return balance * grow - (p * (grow - 1)) / r
}

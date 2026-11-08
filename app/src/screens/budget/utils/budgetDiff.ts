// budget minus actual, both rounded to whole dollars first (every figure on the Budget
// page is whole dollars, so an unrounded diff can read "−$0"). Positive = under budget.
export function budgetDiff(budget: number, actual: number): number {
  const d = Math.round(budget) - Math.round(actual)
  return d === 0 ? 0 : d
}

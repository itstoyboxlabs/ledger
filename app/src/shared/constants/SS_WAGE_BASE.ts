// ---- Social Security retirement benefit estimate ----
//
// Tax year 2026 figures. Sources: SSA, "Benefit Formula Bend Points"
// (https://www.ssa.gov/oact/cola/bendpoints.html) and "Contribution and Benefit
// Base" (https://www.ssa.gov/oact/cola/cbb.html). Bend points 1,286 and 7,749 and
// wage base 184,500 also match the Congressional Research Service overview
// (https://www.congress.gov/crs-product/IF11747). ssa.gov blocked automated fetches
// when this was written, so re-check those two pages when the year changes.
//
// The monthly benefit at full retirement age (the PIA) is 90% of average indexed
// monthly earnings up to the first bend point, 32% from there to the second, and 15%
// above. The estimate here assumes the same salary for 35 years (SSA averages the 35
// best years), capped at the wage base, in today's dollars with no wage indexing.
export const SS_WAGE_BASE = 184500

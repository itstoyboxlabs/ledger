// Claiming at 62 pays 70% of the full amount, 67 pays 100% and 70 pays 124%
// (that 124% is for a full retirement age of 67, i.e. born 1960 or later). Linear
// in between, and clamped outside 62 to 70.
export function ssClaimFactor(claimAge: number | string | undefined): number {
  const a = Math.min(70, Math.max(62, Number(claimAge) || 67))
  return a <= 67 ? 0.7 + ((a - 62) / 5) * 0.3 : 1 + ((a - 67) / 3) * 0.24
}

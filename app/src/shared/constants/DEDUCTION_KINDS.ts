import type { DeductionKindEntry } from '@/shared/types/DeductionKindEntry'
// hypothetical monthly take-home for a yearly salary — same mechanics as the Tools
// tab's Take-home pay calc (401k deferral reduces income tax but not FICA, medical
// premiums reduce both). Shared by the Budget income override and the Retirement
// calc's "auto" savings-contribution source.
// Things that come out of a paycheck. `tax` says which taxes the money skips:
//   income: before income tax only (401k style), FICA still applies
//   all: before every tax including Social Security and Medicare (Section 125)
//   none: after tax, only lowers the final number
export const DEDUCTION_KINDS: readonly DeductionKindEntry[] = [
  ['401k', '401k', 'income'],
  ['roth401k', 'Roth 401k', 'none'],
  ['insurance', 'Health insurance', 'all'],
  ['dental', 'Dental or vision', 'all'],
  ['hsa', 'HSA', 'all'],
  ['fsa', 'FSA', 'all'],
  ['commuter', 'Commuter benefit', 'all'],
  ['life', 'Life or disability insurance', 'none'],
  ['dues', 'Union dues', 'none'],
  ['other-pre', 'Something else, pre-tax', 'income'],
  ['other-post', 'Something else, after tax', 'none'],
]

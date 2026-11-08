import type { FilingStatus } from '@/shared/enums/FilingStatus'
// The 0.9% Additional Medicare Tax applies to wages over these amounts (IRC section 3101(b)(2),
// not indexed). Source: IRS Topic 560, https://www.irs.gov/taxtopics/tc560
// Employers withhold it over $200,000 whatever the filing status, so a married paycheck can
// differ from the yearly tax shown here. The app plans around your own wages only, so the
// joint threshold is compared with your wages alone.
export const ADDL_MEDICARE_OVER: Record<FilingStatus, number> = { single: 200000, mfj: 250000 }

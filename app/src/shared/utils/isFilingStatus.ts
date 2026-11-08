import { FilingStatus } from '@/shared/enums/FilingStatus'

// true for a saved filing status the app knows
export function isFilingStatus(v: unknown): v is FilingStatus {
  return v === FilingStatus.single || v === FilingStatus.mfj
}

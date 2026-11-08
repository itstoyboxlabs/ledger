import type { FilingStatus } from '@/shared/enums/FilingStatus'

// how each filing status is written in the app
export const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  mfj: 'Married filing jointly',
}

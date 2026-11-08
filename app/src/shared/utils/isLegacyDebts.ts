import { LEGACY_DEBTS } from '@/shared/constants/LEGACY_DEBTS'
import type { LegacyDebts } from '@/shared/types/LegacyDebts'
import { isObj } from '@/shared/utils/isObj'

export const isLegacyDebts = (v: unknown): v is LegacyDebts =>
  isObj(v) && LEGACY_DEBTS.every(([k]) => typeof v[k] === 'number')

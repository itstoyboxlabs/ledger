import type { IncomeOverride } from '@/shared/types/IncomeOverride'
import { IncomeSource } from '@/shared/enums/IncomeSource'
export const incomeSourceOf = (ov: IncomeOverride | null | undefined): IncomeSource => (ov?.active === 'manual' ? IncomeSource.manual : ov?.active === true ? IncomeSource.tool : IncomeSource.statements)

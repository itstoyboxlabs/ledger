import { K401_DEFERRAL_LIMIT } from '@/shared/constants/K401_DEFERRAL_LIMIT'
import { fmt0 } from '@/shared/utils/fmt0'

// shown on a 401k row when the yearly limit cut it below the amount entered
export const K401_CAPPED_TIP = `You can put at most ${fmt0(K401_DEFERRAL_LIMIT)} a year into a 401k in 2026, traditional and Roth combined. The rest stays in your paycheck.`

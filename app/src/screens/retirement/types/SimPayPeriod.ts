// A pay period with its sources already looked up, as the projection uses it: the 401k
// (your share `own` and the employer `match`) and `saving` in the period's first year,
// before any raise. `capOwn` keeps your share under the yearly deferral limit as raises
// grow it (typed 401k dollars are taken as they are).
export interface SimPayPeriod {
  fromAge: number
  toAge: number | 'retire'
  raisePct: number
  own: number
  match: number
  capOwn: boolean
  saving: number
}

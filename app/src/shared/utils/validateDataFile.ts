import { isObj } from '@/shared/utils/isObj'
import type { DataFile } from '@/shared/types/DataFile'

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

// throws Error with a friendly message when the file is not a usable ledger file
export function validateDataFile(f: unknown): asserts f is DataFile {
  if (!isObj(f)) throw new Error('That file is not a ledger file.')
  if (f.transactions == null && f.settings == null) {
    throw new Error('This file has no transactions or settings. Pick your ledger-data.json file.')
  }
  if (f.version !== 1) throw new Error('This file has an unknown version. Make a new one and try again.')
  if (f.transactions != null) {
    if (!Array.isArray(f.transactions)) throw new Error('The transactions section looks wrong.')
    const bad = f.transactions.findIndex(
      (t: unknown) => !isObj(t) || typeof t.id !== 'string' || typeof t.date !== 'string' || typeof t.amount !== 'number' || typeof t.kind !== 'string',
    )
    if (bad !== -1) throw new Error(`Transaction ${bad + 1} is missing an id, date, amount or kind.`)
  }
  if (f.accounts != null && !isObj(f.accounts)) throw new Error('The accounts section looks wrong.')
  if (Array.isArray(f.transactions)) {
    const accounts = isObj(f.accounts) ? f.accounts : null
    f.transactions.forEach((t: { id: string; date: string; account?: unknown }, i: number) => {
      const row = `Transaction ${i + 1} (${t.id})`
      if (!DATE_RE.test(t.date)) throw new Error(`${row} has the date "${t.date}". Dates must be YYYY-MM-DD.`)
      if (accounts && (typeof t.account !== 'string' || !Object.hasOwn(accounts, t.account))) {
        throw new Error(`${row} uses the account "${String(t.account ?? '')}", which is not in the accounts section.`)
      }
    })
  }
  if (f.merchants != null && !isObj(f.merchants)) throw new Error('The merchants section looks wrong.')
  if (f.periods != null && !isObj(f.periods)) throw new Error('The periods section looks wrong.')
  if (f.subscriptions != null && !Array.isArray(f.subscriptions)) throw new Error('The subscriptions section looks wrong.')
  if (f.settings != null && !isObj(f.settings)) throw new Error('The settings section looks wrong.')
}

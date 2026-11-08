import { IDB_STORE } from '@/shared/constants/IDB_STORE'
import { openDb } from '@/shared/utils/openDb'

export async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const d = await openDb()
  return new Promise<T | undefined>((resolve, reject) => {
    const req = d.transaction(IDB_STORE).objectStore(IDB_STORE).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

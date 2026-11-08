import { IDB_STORE } from '@/shared/constants/IDB_STORE'
import { openDb } from '@/shared/utils/openDb'

export async function idbDelete(key: string): Promise<void> {
  const d = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = d.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

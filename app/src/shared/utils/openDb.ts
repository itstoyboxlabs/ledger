import { IDB_NAME } from '@/shared/constants/IDB_NAME'
import { IDB_STORE } from '@/shared/constants/IDB_STORE'

let dbPromise
export function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

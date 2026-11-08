import fs from 'node:fs'
import path from 'node:path'
import { applyData } from '@/shared/utils/applyData'

// The fake data the browser tests use. Never read the real ../data folder from a test.
export const SAMPLE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/sample-data.json'), 'utf8'))

// Fills the data module (ALL_TXNS, MONTHS, ACCOUNTS...) the way main.jsx does before the first render.
export function loadSampleData() {
  const { settings: _settings, ...data } = SAMPLE
  applyData(data)
  return data
}

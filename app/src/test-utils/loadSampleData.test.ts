import { getAllTxns } from '@/shared/utils/getAllTxns'
import { getMonths } from '@/shared/utils/getMonths'
import { loadSampleData, SAMPLE } from './loadSampleData'

describe('loadSampleData', () => {
  it('fills the data module from the fake sample file', () => {
    loadSampleData()
    expect(getAllTxns()).toHaveLength(SAMPLE.transactions.length)
    expect(getMonths()[0]).toBe('2026-05')
  })
})

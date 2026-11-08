import { nextSort } from './nextSort'

describe('nextSort', () => {
  it('flips direction on the same column', () => {
    expect(nextSort({ key: 'amount', dir: 'desc' }, 'amount')).toEqual({ key: 'amount', dir: 'asc' })
    expect(nextSort({ key: 'amount', dir: 'asc' }, 'amount')).toEqual({ key: 'amount', dir: 'desc' })
  })
  it('starts the name column A to Z', () => expect(nextSort({ key: 'amount', dir: 'desc' }, 'name')).toEqual({ key: 'name', dir: 'asc' }))
  it('starts number columns biggest first', () => expect(nextSort({ key: 'name', dir: 'asc' }, 'actual')).toEqual({ key: 'actual', dir: 'desc' }))
})

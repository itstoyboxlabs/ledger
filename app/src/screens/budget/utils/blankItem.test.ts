import { blankItem } from './blankItem'

describe('blankItem', () => {
  it('returns an empty monthly item', () => {
    expect(blankItem()).toMatchObject({ name: '', mode: 'month', amount: 0, perWeek: 0 })
  })
  it('gives each item a unique id', () => {
    expect(blankItem().id).toBeTruthy()
    expect(blankItem().id).not.toBe(blankItem().id)
  })
  it('lets overrides win, including the id', () => {
    expect(blankItem({ name: 'Milk', mode: 'week', amount: 4, id: 'x' })).toMatchObject({ id: 'x', name: 'Milk', mode: 'week', amount: 4, perWeek: 0 })
  })
})

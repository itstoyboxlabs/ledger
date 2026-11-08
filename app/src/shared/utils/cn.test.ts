import { cn } from '@/shared/utils/cn'

describe('cn', () => {
  it('joins class names and skips falsy ones', () => {
    expect(cn('a', false, null, 'b')).toBe('a b')
  })

  it('lets a later Tailwind utility win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

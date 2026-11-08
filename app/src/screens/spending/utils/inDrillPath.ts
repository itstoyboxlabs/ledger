import type { Transaction } from '@/shared/types/Transaction'

// true when a transaction sits under the drill path ([] | [cat] | [cat, sub]).
// A missing cat or sub groups under '' (see the rollup key), so it compares as ''.
export function inDrillPath(t: Pick<Transaction, 'cat' | 'sub'>, path: string[]): boolean {
  return (path.length < 1 || (t.cat ?? '') === path[0]) && (path.length < 2 || (t.sub ?? '') === path[1])
}

import type { Cost } from '../types'

export const START: Cost = { turns: 0, total: null, last: null }

// `usd` is the session's running total; a total below the previous one means /clear started over.
export function nextCost(prev: Cost, usd: number | undefined): Cost {
  if (usd === undefined) return { turns: prev.turns + 1, total: null, last: null }

  const before = prev.total === null || usd < prev.total ? 0 : prev.total

  return { turns: prev.turns + 1, total: usd, last: usd - before }
}

export function formatUsd(n: number): string {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

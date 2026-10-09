import { describe, expect, test } from 'claude-code/testing'

import { formatUsd, nextCost, START } from './cost'

describe('nextCost', () => {
  test('first turn is the whole total', () => {
    expect(nextCost(START, 0.12)).toEqual({ turns: 1, total: 0.12, last: 0.12 })
  })

  test('later turn is the difference', () => {
    const prev = { turns: 1, total: 0.12, last: 0.12 }
    const next = nextCost(prev, 0.5)

    expect(next.turns).toBe(2)
    expect(next.total).toBe(0.5)
    expect(Math.round(next.last! * 1000)).toBe(380)
  })

  test('a total below the previous one (after /clear) counts from zero', () => {
    expect(nextCost({ turns: 3, total: 2, last: 1 }, 0.05)).toEqual({ turns: 4, total: 0.05, last: 0.05 })
  })

  test('no cost figure is reported as unavailable, not zero', () => {
    expect(nextCost(START, undefined)).toEqual({ turns: 1, total: null, last: null })
  })
})

describe('formatUsd', () => {
  test('three decimals under a dollar, two above', () => {
    expect(formatUsd(0.0123)).toBe('$0.012')
    expect(formatUsd(1.844)).toBe('$1.84')
  })
})

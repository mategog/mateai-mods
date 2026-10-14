import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reserve, restock } from '../src/inventory.js';

test('reserve and restock', () => {
  const stock = new Map([['ABC-001', 5]]);
  assert.deepEqual(reserve(stock, 'ABC-001', 3), { ok: true, short: 0 });
  assert.deepEqual(reserve(stock, 'ABC-001', 4), { ok: false, short: 2 });
  restock(stock, 'ABC-001', 10);
  assert.equal(stock.get('ABC-001'), 12);
});

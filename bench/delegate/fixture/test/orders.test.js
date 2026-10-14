import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderLine, lineTotal, orderTotal } from '../src/orders.js';

test('line and order totals', () => {
  const a = createOrderLine({ sku: 'ABC-001', qty: 2, priceCents: 250 });
  const b = createOrderLine({ sku: 'XYZ-002', qty: 1, priceCents: 1000 });
  assert.equal(lineTotal(a), 500);
  assert.equal(orderTotal([a, b]), 1500);
});

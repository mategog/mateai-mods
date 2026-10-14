import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderLine } from '../src/orders.js';
import { summarize } from '../src/report.js';

test('summarizes an order', () => {
  const lines = [
    createOrderLine({ sku: 'ABC-001', qty: 10, priceCents: 100 }),
    createOrderLine({ sku: 'XYZ-002', qty: 2, priceCents: 500 }),
  ];
  const s = summarize(lines);
  assert.equal(s.units, 12);
  assert.equal(s.subtotal, 2000);
  assert.equal(s.discount, 100);
  assert.equal(s.shipping, 1100);
  assert.equal(s.total, 3000);
  assert.equal(s.display, '$30.00');
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createOrderLine, lineTotal, orderTotal } from '../src/orders.js';
import { bulkDiscount } from '../src/discounts.js';
import { shippingCost } from '../src/shipping.js';
import { summarize } from '../src/report.js';
import { reserve } from '../src/inventory.js';

test('t3: new field name', () => {
  const line = createOrderLine({ sku: 'ABC-001', quantity: 2, priceCents: 250 });
  assert.equal(line.quantity, 2);
  assert.ok(!('qty' in line), 'no qty property');
  assert.equal(lineTotal(line), 500);
});
test('t3: legacy qty input still accepted', () => {
  const line = createOrderLine({ sku: 'ABC-001', qty: 3, priceCents: 100 });
  assert.equal(line.quantity, 3);
  assert.ok(!('qty' in line), 'no qty property');
});
test('t3: downstream modules use quantity', () => {
  const lines = [
    { sku: 'A', quantity: 10, priceCents: 100 },
    { sku: 'B', quantity: 2, priceCents: 500 },
  ];
  assert.equal(orderTotal(lines), 2000);
  assert.equal(bulkDiscount(lines[0]), 100);
  assert.equal(shippingCost(lines), 1100);
  const s = summarize(lines);
  assert.equal(s.units, 12);
  assert.equal(s.total, 3000);
  const stock = new Map([['A', 5]]);
  assert.deepEqual(reserve(stock, 'A', 3), { ok: true, short: 0 });
});
test('t3: no qty identifiers left outside the legacy mapping', () => {
  for (const dir of ['src', 'test']) {
    for (const f of readdirSync(new URL(`../${dir}/`, import.meta.url))) {
      if (!f.endsWith('.js')) continue;
      const text = readFileSync(new URL(`../${dir}/${f}`, import.meta.url), 'utf8');
      const hits = (text.match(/\bqty\b/g) ?? []).length;
      if (dir === 'src' && f === 'orders.js') {
        assert.ok(hits <= 3, `orders.js keeps qty only for the legacy input (${hits})`);
      } else if (dir === 'test') {
        // a test that exercises the legacy input may mention qty
        continue;
      } else {
        assert.equal(hits, 0, `${dir}/${f} still mentions qty`);
      }
    }
  }
});

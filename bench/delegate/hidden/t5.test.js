import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Money, formatMoney } from '../src/money.js';
import { createOrderLine, lineTotal, orderTotal } from '../src/orders.js';
import { bulkDiscount } from '../src/discounts.js';
import { shippingCost } from '../src/shipping.js';
import { summarize } from '../src/report.js';

test('t5 Money API', () => {
  const a = Money.fromCents(1050);
  assert.equal(a.cents, 1050);
  assert.equal(a.add(Money.fromCents(5)).cents, 1055);
  assert.equal(a.subtract(Money.fromCents(50)).cents, 1000);
  assert.equal(a.multiply(1.5).cents, 1575);
  assert.equal(Money.fromCents(999).percent(10).cents, 100);
  assert.ok(a.equals(Money.fromCents(1050)));
  assert.ok(!a.equals(Money.fromCents(1)));
  assert.equal(String(Money.fromCents(-150)), '-$1.50');
  assert.equal(a.toString(), '$10.50');
  assert.throws(() => Money.fromCents(1.5), RangeError);
  assert.ok(Object.isFrozen(a));
  assert.equal(a.add(Money.fromCents(1)) === a, false);
  assert.equal(formatMoney(1234), '$12.34');
});

test('t5 computed amounts are Money', () => {
  const a = createOrderLine({ sku: 'ABC-001', qty: 10, priceCents: 100 });
  const b = createOrderLine({ sku: 'XYZ-002', qty: 2, priceCents: 500 });
  assert.ok(lineTotal(a) instanceof Money);
  assert.equal(lineTotal(a).cents, 1000);
  assert.ok(orderTotal([a, b]) instanceof Money);
  assert.equal(orderTotal([a, b]).cents, 2000);
  assert.ok(bulkDiscount(a) instanceof Money);
  assert.equal(bulkDiscount(a).cents, 100);
  assert.equal(bulkDiscount(b).cents, 0);
  assert.ok(shippingCost([a, b]) instanceof Money);
  assert.equal(shippingCost([a, b]).cents, 1100);
  const s = summarize([a, b]);
  assert.equal(s.units, 12);
  for (const k of ['subtotal', 'discount', 'shipping', 'total']) assert.ok(s[k] instanceof Money, k);
  assert.equal(s.subtotal.cents, 2000);
  assert.equal(s.discount.cents, 100);
  assert.equal(s.shipping.cents, 1100);
  assert.equal(s.total.cents, 3000);
  assert.equal(s.display, '$30.00');
});

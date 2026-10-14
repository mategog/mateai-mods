import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAX_RATES, regions, calculateTax } from '../src/tax.js';
import { applyCoupon } from '../src/coupons.js';
import { refundCents, summarizeRefunds } from '../src/returns.js';
import { renderInvoice } from '../src/invoice.js';
import { pointsForOrder, tierFor, redeem } from '../src/loyalty.js';
import { ordersToCsv } from '../src/export.js';

const L = (sku, qty, priceCents) => ({ sku, qty, priceCents });

test('t4 tax', () => {
  assert.equal(TAX_RATES.HU, 0.27);
  assert.deepEqual(regions(), ['DE', 'HU', 'US-CA', 'US-NY']);
  const r = calculateTax([L('A', 3, 333), L('B', 1, 1001)], 'US-CA');
  assert.equal(r.rate, 0.0725);
  assert.equal(r.taxCents, Math.round(999 * 0.0725) + Math.round(1001 * 0.0725));
  assert.throws(() => calculateTax([], 'FR'), { message: 'Unknown region: FR' });
});

test('t4 coupons', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  assert.deepEqual(applyCoupon(1999, { code: 'P', type: 'percent', value: 15 }, now),
    { applied: true, reason: null, discountCents: 300, totalCents: 1699 });
  assert.deepEqual(applyCoupon(500, { code: 'F', type: 'fixed', value: 800 }, now),
    { applied: true, reason: null, discountCents: 500, totalCents: 0 });
  assert.deepEqual(applyCoupon(1000, { code: 'E', type: 'fixed', value: 100, expiresAt: '2026-01-01T00:00:00Z' }, now),
    { applied: false, reason: 'expired', discountCents: 0, totalCents: 1000 });
  assert.deepEqual(applyCoupon(1000, { code: 'M', type: 'fixed', value: 100, minSubtotalCents: 5000 }, now),
    { applied: false, reason: 'below-minimum', discountCents: 0, totalCents: 1000 });
  assert.throws(() => applyCoupon(1000, { code: 'X', type: 'percent', value: 120 }, now), RangeError);
});

test('t4 returns', () => {
  const line = L('A', 3, 1001);
  assert.equal(refundCents(line, 2, 30), 2002);
  assert.equal(refundCents(line, 1, 31), 501);
  assert.equal(refundCents(line, 1, 60), 501);
  assert.equal(refundCents(line, 1, 61), 0);
  assert.throws(() => refundCents(line, 4, 1), RangeError);
  assert.throws(() => refundCents(line, 0, 1), RangeError);
  assert.throws(() => refundCents(line, 1.5, 1), RangeError);
  assert.deepEqual(summarizeRefunds([{ sku: 'A', refundCents: 100 }, { sku: 'B', refundCents: 50 }, { sku: 'A', refundCents: 25 }]),
    { count: 3, totalRefundCents: 175, bySku: { A: 125, B: 50 } });
});

test('t4 invoice', () => {
  const lines = [L('ABC-001', 2, 250), L('XYZ-002', 1, 1000)];
  const customer = { name: 'Ada', email: 'ada@example.com' };
  assert.equal(renderInvoice({ number: 'INV-7', customer, lines, discountCents: 150, taxCents: 99 }), [
    'INVOICE INV-7',
    'Bill to: Ada <ada@example.com>',
    'ABC-001 x2 @ $2.50 = $5.00',
    'XYZ-002 x1 @ $10.00 = $10.00',
    'Subtotal: $15.00',
    'Discount: -$1.50',
    'Tax: $0.99',
    'Total: $14.49',
  ].join('\n'));
  assert.equal(renderInvoice({ number: 1, customer, lines: [L('A', 1, 5)] }),
    ['INVOICE 1', 'Bill to: Ada <ada@example.com>', 'A x1 @ $0.05 = $0.05', 'Subtotal: $0.05', 'Tax: $0.00', 'Total: $0.05'].join('\n'));
});

test('t4 loyalty', () => {
  assert.equal(pointsForOrder(1999, 'bronze'), 19);
  assert.equal(pointsForOrder(1999, 'silver'), 28);
  assert.equal(pointsForOrder(1999, 'gold'), 38);
  assert.throws(() => pointsForOrder(100, 'platinum'));
  assert.equal(tierFor(999), 'bronze');
  assert.equal(tierFor(1000), 'silver');
  assert.equal(tierFor(4999), 'silver');
  assert.equal(tierFor(5000), 'gold');
  assert.equal(redeem(100, 40), 60);
  assert.throws(() => redeem(100, 101), RangeError);
  assert.throws(() => redeem(100, 0), RangeError);
  assert.throws(() => redeem(100, 2.5), RangeError);
});

test('t4 export', () => {
  const csv = ordersToCsv([
    { id: 'o1', customerEmail: 'a@x.io', lines: [L('ABC-001', 2, 250), L('B,2', 1, 10)] },
    { id: 'o2', customerEmail: 'say "hi"@x.io', lines: [L('C', 3, 1)] },
  ]);
  assert.equal(csv, [
    'order_id,customer_email,sku,qty,price_cents,line_total_cents',
    'o1,a@x.io,ABC-001,2,250,500',
    'o1,a@x.io,"B,2",1,10,10',
    'o2,"say ""hi""@x.io",C,3,1,3',
  ].join('\n') + '\n');
});

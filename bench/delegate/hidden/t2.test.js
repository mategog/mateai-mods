import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError } from '../src/errors.js';
import { createCustomer } from '../src/customers.js';
import { createProduct } from '../src/products.js';
import { createOrderLine } from '../src/orders.js';

function throwsField(fn, field) {
  assert.throws(fn, (err) => {
    assert.ok(err instanceof ValidationError, 'is ValidationError');
    assert.ok(err instanceof Error, 'extends Error');
    assert.equal(err.name, 'ValidationError');
    assert.equal(err.field, field);
    return true;
  });
}

test('t2: customer validation', () => {
  throwsField(() => createCustomer({ name: '', email: 'a@b.c' }), 'name');
  throwsField(() => createCustomer({ name: 42, email: 'a@b.c' }), 'name');
  throwsField(() => createCustomer({ name: 'Ada', email: 'nope' }), 'email');
  assert.equal(createCustomer({ name: 'Ada', email: 'ada@x.io' }).name, 'Ada');
});
test('t2: product validation', () => {
  throwsField(() => createProduct({ sku: 'abc-001', name: 'W', priceCents: 1 }), 'sku');
  throwsField(() => createProduct({ sku: 'ABC-01', name: 'W', priceCents: 1 }), 'sku');
  throwsField(() => createProduct({ sku: 'ABC-001', name: 'W', priceCents: -1 }), 'priceCents');
  throwsField(() => createProduct({ sku: 'ABC-001', name: 'W', priceCents: 1.5 }), 'priceCents');
  assert.equal(createProduct({ sku: 'ABC-001', name: 'W', priceCents: 0 }).priceCents, 0);
});
test('t2: order line validation', () => {
  throwsField(() => createOrderLine({ sku: 'ABC-001', qty: 0, priceCents: 1 }), 'qty');
  throwsField(() => createOrderLine({ sku: 'ABC-001', qty: 1.5, priceCents: 1 }), 'qty');
  throwsField(() => createOrderLine({ sku: 'ABC-001', qty: 1, priceCents: -5 }), 'priceCents');
  assert.deepEqual(createOrderLine({ sku: 'ABC-001', qty: 2, priceCents: 0 }), { sku: 'ABC-001', qty: 2, priceCents: 0 });
});

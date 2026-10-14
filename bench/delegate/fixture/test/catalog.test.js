import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCustomer } from '../src/customers.js';
import { createProduct } from '../src/products.js';

test('creates customers and products with ids', () => {
  const c = createCustomer({ name: 'Ada', email: 'ada@example.com' });
  const p = createProduct({ sku: 'ABC-001', name: 'Widget', priceCents: 999 });
  assert.match(c.id, /^cus_\d+$/);
  assert.match(p.id, /^prd_\d+$/);
  assert.equal(p.priceCents, 999);
});

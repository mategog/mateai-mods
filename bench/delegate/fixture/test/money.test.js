import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../src/money.js';

test('formats cents', () => {
  assert.equal(formatMoney(1234), '$12.34');
  assert.equal(formatMoney(5), '$0.05');
  assert.equal(formatMoney(-150), '-$1.50');
});

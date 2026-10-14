import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsvLine, parseCsv } from '../src/csv.js';

test('splits simple fields', () => {
  assert.deepEqual(parseCsvLine('a,b,c'), ['a', 'b', 'c']);
});

test('parses multiple lines', () => {
  assert.deepEqual(parseCsv('a,b\nc,d\n'), [['a', 'b'], ['c', 'd']]);
});

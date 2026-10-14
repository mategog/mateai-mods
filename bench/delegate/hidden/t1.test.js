import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsvLine, parseCsv } from '../src/csv.js';

test('t1: simple fields still work', () => {
  assert.deepEqual(parseCsvLine('a,b,c'), ['a', 'b', 'c']);
  assert.deepEqual(parseCsvLine(' a , b '), ['a', 'b']);
});
test('t1: quoted field with comma', () => {
  assert.deepEqual(parseCsvLine('a,"b,c",d'), ['a', 'b,c', 'd']);
});
test('t1: escaped quotes', () => {
  assert.deepEqual(parseCsvLine('"say ""hi""",x'), ['say "hi"', 'x']);
});
test('t1: empty fields', () => {
  assert.deepEqual(parseCsvLine('a,,c'), ['a', '', 'c']);
  assert.deepEqual(parseCsvLine('a,""'), ['a', '']);
});
test('t1: parseCsv uses the fixed line parser', () => {
  assert.deepEqual(parseCsv('x,"1,2"\ny,3\n'), [['x', '1,2'], ['y', '3']]);
});

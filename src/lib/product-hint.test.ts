import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeProductHint } from './product-hint';

test('maps paxta aliases to хлопок', () => {
  assert.equal(normalizeProductHint('paxta'), 'хлопок');
  assert.equal(normalizeProductHint('Cotton raw'), 'хлопок');
});

test('keeps unknown hints trimmed', () => {
  assert.equal(normalizeProductHint('  sement  '), 'sement');
});

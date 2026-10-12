import test from 'node:test';
import assert from 'node:assert/strict';
import { VendingPreview } from '../src/vending.js';

test('requires product selection, simulated payment, then dispensing', () => {
  const machine = new VendingPreview(2);
  assert.equal(machine.advance().accepted, false);
  assert.equal(machine.select(0).state, 'selected');
  assert.equal(machine.advance().state, 'paid');
  const result = machine.advance();
  assert.equal(result.state, 'dispensed');
  assert.equal(result.remaining, 1);
  assert.equal(machine.availableProducts.has(0), false);
});

test('rejects unavailable items and blocks starting a second purchase mid-transaction', () => {
  const machine = new VendingPreview(1);
  machine.select(0);
  assert.equal(machine.select().accepted, false);
  machine.advance();
  machine.advance();
  assert.equal(machine.select(0).action, 'empty');
  assert.equal(machine.select().action, 'empty');
});

test('can begin a new transaction after a product has been dispensed', () => {
  const machine = new VendingPreview(2);
  machine.select(0);
  machine.advance();
  machine.advance();
  assert.equal(machine.select().productId, 1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState } from '../src/storage.js';

test('returns a clean state when persisted JSON is malformed', () => {
  const storage = { getItem: () => '{bad json' };
  assert.deepEqual(loadState(storage), { attempts: [], drafts: {} });
});

test('reports storage write failure rather than claiming persistence', () => {
  const storage = { setItem: () => { throw new Error('quota exceeded'); } };
  assert.equal(saveState({ attempts: [], drafts: {} }, storage), false);
});

test('round-trips a saved draft and attempt collection', () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const state = { attempts: [{ id: 'a1' }], drafts: { 'parking-lot': { classes: 'Lot' } } };
  assert.equal(saveState(state, storage), true);
  assert.deepEqual(loadState(storage), state);
});

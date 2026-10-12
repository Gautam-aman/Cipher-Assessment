import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSubmission, validateSubmission } from '../src/evaluation.js';
import { problems } from '../src/problems.js';

const complete = { requirements: 'Vehicle enters and ticket is created, reject duplicate parking.', classes: 'ParkingLot coordinates Vehicle and Spot; FeePolicy owns pricing responsibility.', relationships: 'ParkingLot contains Levels and uses FeePolicy.', tradeoffs: 'Strategy interface keeps pricing replaceable because weekday pricing can change. Test full lot and duplicate entry.' };

test('rejects incomplete submissions with actionable missing sections', () => {
  const result = evaluateSubmission({ ...complete, classes: 'x' }, problems[0]);
  assert.equal(result.status, 'invalid');
  assert.ok(result.missing.some((item) => item.startsWith('Classes')));
  assert.ok(result.missing.some((item) => item.startsWith('Requirement')) === false);
});

test('scores a complete design and ties feedback to evidence', () => {
  const result = evaluateSubmission(complete, problems[0]);
  assert.equal(result.status, 'completed');
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.equal(result.criteria.length, 6);
  assert.ok(result.criteria.find((item) => item.id === 'boundaries').evidence.includes('strategy'));
  assert.match(result.criteria.find((item) => item.id === 'resilience').feedback, /test case/i);
});

test('validation handles missing and whitespace-only values', () => {
  const missing = validateSubmission({ requirements: '  ', classes: '', relationships: undefined, tradeoffs: null });
  assert.equal(missing.length, 4);
});

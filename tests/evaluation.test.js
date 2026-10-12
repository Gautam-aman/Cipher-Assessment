import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSubmission, validateSubmission } from '../src/evaluation.js';
import { problems } from '../src/problems.js';

const complete = {
  requirements: 'Vehicle enters, receives a ticket, and cannot occupy a duplicate spot.',
  classes: 'ParkingLot coordinates Vehicle and Spot. FeePolicy owns duration-based fee calculation.',
  relationships: 'ParkingLot calls FeePolicy, then TicketStore returns the ticket result.',
  tradeoffs: 'A Strategy interface keeps weekday pricing replaceable; its trade-off is added policy complexity. If the lot is full, reject entry and leave capacity unchanged. Test full-lot and duplicate-entry cases. The day-of-week pricing change needs its own policy.'
};

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
  assert.match(result.criteria.find((item) => item.id === 'boundaries').evidence[0], /Strategy interface/);
  assert.match(result.criteria.find((item) => item.id === 'resilience').feedback, /test/i);
  assert.ok(result.criteria.every((item) => item.score >= 0 && item.score <= item.outOf));
  assert.ok(result.criteria.find((item) => item.id === 'coverage').evidence.some((excerpt) => complete.requirements.includes(excerpt)));
});

test('validation handles missing and whitespace-only values', () => {
  const missing = validateSubmission({ requirements: '  ', classes: '', relationships: undefined, tradeoffs: null });
  assert.equal(missing.length, 4);
  assert.equal(validateSubmission(null).length, 4);
  assert.equal(evaluateSubmission(null, problems[0]).status, 'invalid');
});

test('irrelevant repeated keywords do not earn rubric points', () => {
  const noise = {
    requirements: 'ParkingLot '.repeat(4),
    classes: 'ParkingLot '.repeat(4),
    relationships: 'ParkingLot '.repeat(3),
    tradeoffs: 'ParkingLot '.repeat(4)
  };
  const result = evaluateSubmission(noise, problems[0]);
  assert.equal(result.status, 'completed');
  assert.equal(result.score, 0);
  assert.ok(result.criteria.every((item) => item.evidence.length === 0));
});

test('scores problem requirements using challenge-specific signals', () => {
  const parkingResult = evaluateSubmission({ ...complete, requirements: 'Cars, buses, tickets, entry, pricing, fees and duration.' }, problems[0]);
  const vendingResult = evaluateSubmission({ ...complete, requirements: 'Inventory, payment, products, cancel and refund.' }, problems[1]);
  assert.equal(parkingResult.criteria[0].score, 4);
  assert.equal(vendingResult.criteria[0].score, 4);
  assert.notEqual(problems[0].coverageSignals, problems[1].coverageSignals);
});

test('rubric dimensions only inspect their relevant answer sections', () => {
  const draft = {
    requirements: 'A sufficiently detailed prompt response about parking and a ticket.',
    classes: 'PricingStrategy interface because extension changes, and complexity is reduced.',
    relationships: 'ParkingLot calls TicketStore, then returns the ticket result.',
    tradeoffs: 'A test will verify a full parking lot.'
  };
  const result = evaluateSubmission(draft, problems[0]);
  assert.equal(result.criteria.find((item) => item.id === 'reasoning').score, 0);
  assert.equal(result.criteria.find((item) => item.id === 'boundaries').score, 2);
});

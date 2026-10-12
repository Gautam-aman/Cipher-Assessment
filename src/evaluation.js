const dimensions = [
  { id: 'coverage', label: 'Requirement coverage', help: 'Do the proposed objects and workflows address the stated behavior?', terms: ['ticket','vehicle','spot','fee','inventory','payment','refund','elevator','request','floor','capacity','door'] },
  { id: 'responsibility', label: 'Clear responsibilities', help: 'Does each class own a focused piece of behavior?', terms: ['class','responsibility','owns','handles','service','controller','policy','strategy','repository'] },
  { id: 'boundaries', label: 'Useful boundaries', help: 'Can likely-to-change rules vary behind a small interface?', terms: ['interface','abstract','strategy','policy','pricing','payment','allocator','evaluator'] },
  { id: 'collaboration', label: 'Relationships & collaboration', help: 'Can a reader follow how the objects work together?', terms: ['uses','has','contains','belongs','relationship','composition','association','delegates','calls'] },
  { id: 'resilience', label: 'Edge cases & testability', help: 'Are failure paths explicit and behavior testable?', terms: ['test','edge','failure','invalid','duplicate','concurrent','refund','capacity','not found','throws'] },
  { id: 'reasoning', label: 'Trade-off reasoning', help: 'Does the explanation defend choices and name a cost?', terms: ['because','trade-off','tradeoff','why','instead','simpler','cost','assumption','change'] }
];

export function validateSubmission(draft) {
  const missing = [];
  if ((draft.requirements ?? '').trim().length < 20) missing.push('Requirement breakdown (at least 20 characters)');
  if ((draft.classes ?? '').trim().length < 20) missing.push('Classes and responsibilities (at least 20 characters)');
  if ((draft.relationships ?? '').trim().length < 12) missing.push('Relationships (at least 12 characters)');
  if ((draft.tradeoffs ?? '').trim().length < 20) missing.push('Trade-offs and edge cases (at least 20 characters)');
  return missing;
}

export function evaluateSubmission(draft, problem) {
  const missing = validateSubmission(draft);
  if (missing.length) return { status: 'invalid', missing, score: 0, criteria: [] };
  const text = Object.values(draft).join(' ').toLowerCase();
  const criteria = dimensions.map((dimension) => {
    const evidence = dimension.terms.filter((term) => text.includes(term));
    const score = Math.min(4, evidence.length > 2 ? 4 : evidence.length > 0 ? 3 : 2);
    const notes = {
      coverage: evidence.length ? `Your design names ${evidence.slice(0, 3).join(', ')}. Check each requirement above against a concrete operation.` : 'The submission does not yet name domain behavior from the problem. Map each requirement to an operation or object.',
      responsibility: evidence.length ? `You mention ${evidence.slice(0, 3).join(', ')}. Make ownership explicit: who creates, changes, and validates each object?` : 'Name the objects that own decisions, then give each one a single reason to change.',
      boundaries: evidence.length ? `You call out ${evidence.slice(0, 3).join(', ')}. State the contract and identify the concrete implementations that can vary.` : 'The extension introduces changing rules. Consider a small interface at that seam and explain why it earns its cost.',
      collaboration: evidence.length ? `You describe ${evidence.slice(0, 3).join(', ')}. Add one end-to-end call sequence so object collaboration is easy to trace.` : 'Show who calls whom in the main workflow and who owns the lifecycle of related objects.',
      resilience: evidence.length ? `You consider ${evidence.slice(0, 3).join(', ')}. Add a test case for each failure path and define the expected state afterward.` : 'Name a failure path such as duplicate requests, unavailable resources, or invalid state, then describe the expected outcome.',
      reasoning: evidence.length ? `Your rationale includes ${evidence.slice(0, 3).join(', ')}. Connect the choice to the ${problem.extension.toLowerCase()} extension and state the trade-off.` : `Explain why the design handles this change: “${problem.extension}” What becomes simpler, and what becomes more complex?`
    };
    return { id: dimension.id, label: dimension.label, score, outOf: 4, evidence: evidence.length ? evidence.slice(0, 4) : [], feedback: notes[dimension.id] };
  });
  return { status: 'completed', score: Math.round(criteria.reduce((sum, item) => sum + item.score, 0) / criteria.length * 25), criteria, evaluatedAt: new Date().toISOString() };
}

const stopWords = new Set('about after again against all also an and any are across as at be because before between both by can could does each for from had has have how into is it its may more most need of on one or other our out over per should so some such than that the their them then there these they this through to under until up use using was were what when where which who why will with would'.split(' '));

const splitSentences = (value = '') => String(value).split(/\n+|(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
const words = (value = '') => String(value).toLowerCase().match(/[a-z][a-z0-9-]*/g) ?? [];
const termPattern = (term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?=$|[^a-z0-9])`, 'i');
const containsAny = (text, terms) => terms.some((term) => termPattern(term).test(text));
const excerptsFor = (fields, predicate) => [...new Set(fields.flatMap((field) => splitSentences(field).filter(predicate)))].map((line) => line.length > 180 ? `${line.slice(0, 177).trimEnd()}…` : line).slice(0, 3);

const cue = {
  roles: ['class', 'service', 'controller', 'repository', 'policy', 'strategy', 'manager', 'allocator', 'gateway', 'handler', 'store', 'engine', 'factory', 'coordinator', 'worker', 'scheduler', 'adapter', 'database', 'cache', 'queue'],
  ownership: ['owns', 'owner', 'responsible', 'handles', 'creates', 'coordinates', 'validates', 'calculates', 'assigns', 'manages', 'encapsulates', 'delegates'],
  boundaries: ['interface', 'abstraction', 'strategy', 'policy', 'adapter', 'port', 'provider', 'implementation', 'contract'],
  variation: ['vary', 'varies', 'replace', 'replaceable', 'swap', 'plug', 'change', 'extension', 'configurable', 'configuration', 'different'],
  flow: ['calls', 'uses', 'delegates', 'sends', 'returns', 'creates', 'emits', 'subscribes', 'waits', 'reads', 'writes', 'updates', 'then', 'before', 'after', 'finally', 'sequence'],
  edge: ['if', 'when', 'failure', 'fail', 'invalid', 'duplicate', 'timeout', 'unavailable', 'empty', 'full', 'capacity', 'concurrent', 'retry', 'refund', 'rollback', 'out of stock', 'not found', 'cancel', 'offline'],
  outcome: ['reject', 'return', 'restore', 'retry', 'rollback', 'remain', 'never', 'ensure', 'throw', 'emit', 'cancel', 'refund', 'report', 'recover', 'compensate'],
  tests: ['test', 'tests', 'testing', 'assert', 'verify', 'scenario', 'given', 'when', 'then'],
};

export function validateSubmission(draft = {}) {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) draft = {};
  const missing = [];
  if (String(draft.requirements ?? '').trim().length < 20) missing.push('Requirement breakdown (at least 20 characters)');
  if (String(draft.classes ?? '').trim().length < 20) missing.push('Classes and responsibilities (at least 20 characters)');
  if (String(draft.relationships ?? '').trim().length < 12) missing.push('Relationships (at least 12 characters)');
  if (String(draft.tradeoffs ?? '').trim().length < 20) missing.push('Trade-offs and edge cases (at least 20 characters)');
  return missing;
}

function requirementCoverage(draft, problem) {
  const fields = [draft.requirements, draft.classes, draft.relationships].map((value) => String(value ?? ''));
  const allText = fields.join('\n');
  const requirements = problem.requirements.map((requirement, index) => {
    const terms = problem.coverageSignals?.[index] ?? words(requirement).filter((word) => word.length >= 5 && !stopWords.has(word));
    const matchedTerms = terms.filter((term) => termPattern(term).test(allText));
    return { requirement, terms, matchedTerms, matched: matchedTerms.length > 0 };
  });
  const matched = requirements.filter((item) => item.matched);
  const score = Math.round(4 * matched.length / Math.max(1, requirements.length));
  const evidence = excerptsFor(fields, (line) => requirements.some((item) => item.matched && item.matchedTerms.some((term) => termPattern(term).test(line))));
  const remaining = requirements.filter((item) => !item.matched).map((item) => item.requirement);
  let feedback;
  if (remaining.length) feedback = `Map each requirement to a concrete behavior. Still uncovered: ${remaining.slice(0, 2).join(' ')}`;
  else feedback = 'The draft touches every prompt requirement. Make each mapping explicit by naming the responsible operation or object.';
  return { score, evidence, feedback };
}

function criterion(id, label, fields, groups, feedback) {
  const text = fields.map((field) => String(field ?? '')).join('\n');
  const matchedGroups = groups.filter((group) => group.test(text));
  const score = matchedGroups.length;
  const evidence = excerptsFor(fields, (line) => matchedGroups.some((group) => group.test(line)));
  return { id, label, score, outOf: 4, evidence, feedback: feedback(score, matchedGroups.length, evidence) };
}

export function evaluateSubmission(draft = {}, problem) {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) draft = {};
  const missing = validateSubmission(draft);
  if (missing.length) return { status: 'invalid', missing, score: 0, criteria: [] };
  if (!problem || !Array.isArray(problem.requirements) || !problem.requirements.length) throw new TypeError('A problem with requirements is required for evaluation.');

  const requirement = requirementCoverage(draft, problem);
  const roleText = String(draft.classes ?? '');
  const boundariesText = `${draft.classes ?? ''}\n${draft.tradeoffs ?? ''}`;
  const relationshipText = String(draft.relationships ?? '');
  const resilienceText = String(draft.tradeoffs ?? '');
  const rationaleText = String(draft.tradeoffs ?? '');
  const extensionTerms = [...new Set(words(problem.extension).filter((word) => word.length >= 5 && !stopWords.has(word)))];
  const patternGroup = (terms, source) => ({ test: (text) => containsAny(text, terms), source });
  const criteria = [
    { id: 'coverage', label: 'Requirement coverage', score: requirement.score, outOf: 4, evidence: requirement.evidence, feedback: requirement.feedback },
    criterion('responsibility', 'Clear responsibilities', [roleText], [
      patternGroup(cue.roles),
      patternGroup(cue.ownership),
      { test: (text) => /\b(?:one|single|focused|cohesive)\b.{0,60}\b(?:responsibility|reason to change|purpose|job)\b/i.test(text) || /\b(?:responsibility|reason to change|purpose|job)\b.{0,60}\b(?:one|single|focused|cohesive)\b/i.test(text) },
      { test: (text) => new Set(text.match(/\b[A-Z][A-Za-z0-9]{2,}\b/g) ?? []).size >= 2 }
    ], (score) => score < 2 ? 'Name the core objects and pair each one with a specific behavior it owns.' : 'Connect each named object to one clear responsibility; avoid leaving ownership implicit.'),
    criterion('boundaries', 'Useful boundaries', [boundariesText], [
      patternGroup(cue.boundaries),
      patternGroup(cue.variation),
      { test: (text) => containsAny(text, ['contract', 'accepts', 'returns', 'implements', 'conforms', 'method signature']) },
      { test: (text) => containsAny(text, ['default implementation', 'concrete strategy', 'concrete policy', 'alternate implementation', 'swap implementations']) }
    ], (score) => score < 2 ? 'Identify a likely-to-change rule, define the boundary, and name one implementation that can vary.' : `Relate the boundary to the prompt extension: “${problem.extension}”`),
    criterion('collaboration', 'Relationships & collaboration', [relationshipText], [
      patternGroup(cue.flow),
      { test: (text) => /(?:->|→|\bthen\b.*\bthen\b|\bfirst\b.*\bnext\b|\bsequence\b)/i.test(text) },
      { test: (text) => /\b(?:request|response|result|state|lifecycle|returns?|updates?|creates?)\b/i.test(text) },
      { test: (text) => /\b[A-Z][A-Za-z0-9]+\s+(?:calls|uses|sends|returns|updates|creates|delegates)\s+[A-Z][A-Za-z0-9]+\b/i.test(text) }
    ], (score) => score < 2 ? 'Walk through one request in order: who receives it, which object acts next, and what result returns?' : 'Make the main request sequence explicit, including the result or state change at the end.'),
    criterion('resilience', 'Edge cases & testability', [resilienceText], [
      patternGroup(cue.edge),
      patternGroup(cue.outcome),
      patternGroup(cue.tests),
      { test: (text) => /\b(?:state|inventory|balance|capacity|count)\b.{0,55}\b(?:unchanged|consistent|safe|restored|at most once|not lost)\b/i.test(text) || /\b(?:unchanged|consistent|safe|restored|at most once|not lost)\b.{0,55}\b(?:state|inventory|balance|capacity|count)\b/i.test(text) }
    ], (score) => score < 3 ? 'For one failure case, state the expected outcome and add a test that proves the state remains safe.' : 'A failure case, expected outcome, test, and recovery invariant are represented.'),
    criterion('reasoning', 'Trade-off reasoning', [rationaleText], [
      patternGroup(['because', 'so that', 'therefore', 'trade-off', 'tradeoff', 'assumption', 'assume', 'prefer', 'choose', 'chosen']),
      patternGroup(['cost', 'overhead', 'latency', 'consistency', 'availability', 'complexity', 'simpler', 'instead']),
      { test: (text) => containsAny(text, extensionTerms) },
      patternGroup(['alternative', 'another option', 'compared with', 'compared to', 'rather than'])
    ], (score) => score < 2 ? `Explain why the design fits the change prompt, and name the complexity or cost it introduces: ${problem.extension}` : 'State both the benefit and the cost of the choice, then tie it to the change prompt.')
  ];
  return {
    status: 'completed',
    score: Math.round(criteria.reduce((sum, item) => sum + item.score, 0) / criteria.length * 25),
    criteria,
    evaluatedAt: new Date().toISOString()
  };
}

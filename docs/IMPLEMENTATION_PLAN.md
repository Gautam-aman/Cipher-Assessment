# Implementation plan

## 1. Proposed architecture

Build a single-page, static browser application with a tiny Node development server. Keep the learner workflow in one view and avoid a framework or backend that does not strengthen this prototype.

```text
index.html + styles.css
       │ events / view rendering
    src/app.js ─────── src/problems.js
       │                    problem catalog
       ├── src/evaluation.js   validation + deterministic rubric
       └── src/storage.js      localStorage adapter
```

## 2. Component responsibilities

- **Problem catalog** (`src/problems.js`): immutable prompt data, requirements, and extension scenario.
- **Workspace/view controller** (`src/app.js`): selects a problem, binds fields, renders states/feedback/history, and coordinates use cases.
- **Submission validator and evaluator** (`src/evaluation.js`): pure functions. Validate structural completeness, then return a consistent evaluation result with criterion evidence and guidance.
- **Browser persistence adapter** (`src/storage.js`): versioned key, safe parsing, graceful unavailable/quota handling.
- **Static server** (`server.mjs`): serves local files with basic content security headers; no API or credential surface.

## 3. Data model and storage

`Problem { id, title, category, level, minutes, summary, requirements[], extension }`

`Draft { requirements, classes, relationships, tradeoffs }`

`Attempt { id, problemId, number, createdAt, submission: Draft, status, evaluation }`

`Evaluation { status, score, criteria: [{ id, label, score, outOf, evidence[], feedback }], evaluatedAt }`

The adapter stores `{ attempts: Attempt[], drafts: Record<problemId, Draft> }` under `blueprint.practice.v1`. No personal data is requested. Evaluation is synchronous in the MVP; status fields reserve a practical seam for an eventual asynchronous evaluator.

## 4. API contracts

No network API is needed. Domain contracts are pure JavaScript functions:

- `validateSubmission(draft) → missingSections[]`
- `evaluateSubmission(draft, problem) → Evaluation | { status: 'invalid', missing[] }`
- `loadState(storage?) → { attempts, drafts }`
- `saveState(state, storage?) → boolean`

An alternate evaluator can implement the same structured `Evaluation` result without changing problem selection or attempt history.

## 5. Key workflows

1. Choose a problem; its context and previous attempts appear.
2. Write a structured design; edits are saved locally.
3. Submit; completeness checks return inline guidance or a completed attempt.
4. Review six rubric dimensions, score evidence, and next-step prompts.
5. Reopen prior feedback or start a fresh attempt for the same problem.

## 6. Error handling

- Validate all required text before saving a submission.
- Corrupt or unavailable local storage falls back to an empty in-memory state.
- A failed write is surfaced as session-only persistence; the UI does not claim it was saved.
- Render user-supplied text as escaped text, never HTML.
- A future network evaluator must store the attempt before invoking evaluation, mark `evaluating`, and persist either `completed` or `failed` with a retry path.

## 7. Authentication and authorization

Not applicable to this local, single-user prototype. There are no accounts, server endpoints, or secrets.

## 8. Testing strategy

Use Node's built-in test runner for pure submission validation and rubric behavior: normal submission, missing/whitespace fields, criterion/evidence shape, and feedback availability. Run a real browser workflow manually for problem selection, autosave/reload, submit, history reopen, and narrow-screen layout when browser tooling is available.

## 9. Deployment strategy

Run locally with Node; no deployment is required. A static host can serve the same files if a demo URL is later requested. Browser data remains local to the visitor.

## 10. Ordered milestones

- **P0** Assessment analysis and requirements traceability; problem selection; structured attempt; submit/status; explainable feedback; attempt history.
- **P1** Input validation; storage failure handling; responsive/accessibility states; automated domain tests; clear run instructions.
- **P2** Thoughtful rubric evidence and extension prompts; historical review and easy retry.
- **P3** Visual polish only where it improves scanning and learner confidence.

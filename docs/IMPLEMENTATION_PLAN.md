# Implementation map

This document describes the implemented prototype boundaries and the remaining engineering work. It supersedes the original proposal now that the HLD canvas, revision memory, and evidence excerpts are implemented.

## As-built modules

```text
index.html + styles.css
       │ view/events
   src/app.js ────── src/problems.js
       ├──────────── src/evaluation.js
       ├──────────── src/storage.js
       ├──────────── src/hld.js ── separate diagram localStorage key
       └── lazy ──── src/scene.js ── src/vending.js
```

- `src/problems.js`: challenge context, requirements, extension prompts, and requirement-matching cues.
- `src/app.js`: LLD workflow, local drafts/attempts/revision controls, rendering, and preview coordination.
- `src/evaluation.js`: pure completeness checks and deterministic section-aware rubric signals with answer excerpts.
- `src/storage.js`: safe localStorage parsing and writes for LLD drafts, attempts, revision focus, and notes.
- `src/hld.js`: independent per-challenge SVG canvas state and interactions. The board does not yet join an LLD `Attempt` snapshot.
- `src/scene.js` / `src/vending.js`: lazy 3D previews and a reusable purchase state machine.

## State contracts

`Problem { id, title, requirements[], coverageSignals[][], extension }`

`Draft { requirements, classes, relationships, tradeoffs }`

`Attempt { id, problemId, number, createdAt, submission, revisionOf, status, evaluation }`

`Evaluation { status, score, criteria: [{ id, label, score, outOf, evidence[], feedback }], evaluatedAt }`

`HldDiagram { nodes: [{ id, type, x, y, w, h, label }], edges: [{ id, from, to }] }`

The HLD diagram is saved separately per challenge. If diagrams later become evaluated submissions, version and snapshot them immutably in each attempt before changing scoring or presentation behavior.

## Remaining verification work

1. Add browser-level tests for the complete LLD flow, local reload, history/revision behavior, responsive layout, and reduced motion.
2. Exercise HLD drag/connect/rename/delete/undo/export in a real browser and verify the exported SVG retains all component colors and arrows.
3. Check console/network errors and verify that the hosted deployment matches the current commit.
4. Keep the deterministic evaluator clearly labeled; move to semantic evaluation only with cited evidence and fixed test cases.

## Local commands

```sh
npm test
node --check src/app.js
npm start
```

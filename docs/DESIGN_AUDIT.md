# Design audit — Architecture studio

## Current experience

- One responsive practice workspace with three LLD challenges and challenge-specific 3D previews.
- Four-part structured text editor, readiness feedback, local drafts, deterministic rubric review, attempt history, revision focus, and key notes.
- A distinct HLD board with prefilled component-flow examples, draggable SVG nodes, directed connectors, rename/delete/undo, local autosave, and SVG export.
- White drafting-paper surfaces, graphite type, measured grid lines, and cobalt/teal accents. Motion is present in the hero, gallery, model interactions, and state feedback; reduced-motion rules are present.

## Engineering assessment

- The problem catalog, evaluator, persistence, vending state machine, Three.js scene, and HLD editor are separated into native modules.
- Rubric scoring is section-aware and problem-specific for requirement coverage, with matching answer excerpts displayed to learners. The evaluator is still deterministic and lexical, not a semantic judge.
- Learner text is escaped before dynamic HTML insertion. HLD labels are escaped before SVG insertion. Storage is browser-local and has no cross-device recovery.

## Open gaps that affect a live assessment

1. Browser workflows and the HLD pointer interactions have no automated end-to-end coverage. Verify them in a browser before the interview.
2. The HLD board is not snapshotted with an LLD attempt and is not scored. Present it as a separate practice aid.
3. The assessment asks for `AI_USAGE.md`, while the candidate requested that section be merged into README. Confirm the submission format is acceptable.
4. Check that the hosted deployment matches this working tree; a URL alone is not proof of version parity.

## Verification boundary

Current repository verification is `npm test`, JavaScript syntax checks, and `git diff --check`. These do not prove rendering, pointer behavior, WebGL, responsive viewport fit, or production runtime behavior. Refer to [the readiness report](SUBMISSION_REPORT.md) for the current evidence and candidate demo plan.

# Design note

## MVP and learner flow

Blueprint is a browser-local practice studio: choose one of three prompts, inspect its interactive preview, write requirements and assumptions, name classes and responsibilities, describe relationships and a main flow, then explain trade-offs, edge cases, and tests. Submit to receive a six-dimension review and revisit prior attempts before trying again. A separate high-level design canvas provides a challenge-specific starter diagram that learners can rearrange and export. The HLD diagram is not currently attached to a reviewed attempt; the rubric evaluates the structured LLD text.

## Core domain model

- `Problem` is prompt content and an extension scenario.
- `Draft` is a learner's structured text submission, independent of any one evaluator.
- `Attempt` captures a draft snapshot, creation time, status, and immutable evaluation result.
- `Evaluation` is a rubric result, not a canonical solution. Each criterion carries a score, excerpts from the relevant answer section, and a specific next-step suggestion.
- `HldDiagram` is a separate per-challenge artifact containing component nodes and directed relationships. It persists independently from LLD attempt snapshots.
- `validateSubmission` and `evaluateSubmission` are pure functions; browser persistence is an adapter. UI code coordinates these parts rather than owning rubric rules.

The evaluator contract (`status`, `score`, `criteria`, `evaluatedAt`) lets rule-based, LLM, or human review coexist later. The HLD canvas is intentionally a separate learning aid today; integrating a versioned diagram snapshot into an attempt is a future extension and must not rewrite historical designs.

## Evaluation approach

Completeness is a deterministic gate. The current rubric uses challenge-specific requirement cues and section-specific signals for six aspects: requirement coverage, responsibility clarity, boundaries, collaboration, resilience/testability, and design reasoning. It shows matching excerpts from the learner's answer and provides targeted next steps, not a reference design. It is still a lexical prototype: synonyms may be missed, a cue can appear without a sound design, and users can game the score. A semantic evaluator should be added only behind the same schema and should cite specific submission excerpts.

## Trade-offs

- Structured LLD text keeps evaluated submissions accessible and reviewable. The HLD canvas adds visual modeling but is not part of current attempt scoring or presentation mode.
- `localStorage` keeps setup friction and infrastructure low; the corresponding limitation is browser-local, non-account history.
- Synchronous deterministic review keeps the two-day prototype reliable. If AI review is introduced, persist before evaluation, show evaluating/failed state, prevent duplicate evaluation, and allow retry without losing the submission.
- A static monolith is appropriate. The first component to separate at higher usage would be slow evaluation, not the problem catalog or UI.

# Design note

## MVP and learner flow

Blueprint is a single-screen practice studio: choose one of three prompts, draft the requirements and assumptions, name classes and responsibilities, describe relationships and a main flow, then explain trade-offs, edge cases, and tests. Submit to receive a six-dimension review and revisit prior attempts before trying again.

## Core domain model

- `Problem` is prompt content and an extension scenario.
- `Draft` is a learner's structured text submission, independent of any one evaluator.
- `Attempt` captures a draft snapshot, creation time, status, and immutable evaluation result.
- `Evaluation` is a rubric result, not a canonical solution. Each criterion carries a score, evidence tokens, and a specific next-step suggestion.
- `validateSubmission` and `evaluateSubmission` are pure functions; browser persistence is an adapter. UI code coordinates these parts rather than owning rubric rules.

The evaluator contract (`status`, `score`, `criteria`, `evaluatedAt`) lets rule-based, LLM, or human review coexist later. A future diagram can be added as a submission format alongside text; it need not change attempt history or feedback display.

## Evaluation approach

Completeness is a deterministic gate. The current rubric also uses transparent deterministic cues for six aspects: requirement coverage, responsibility clarity, boundaries, collaboration, resilience/testability, and design reasoning. It provides short targeted suggestions, not a reference design. This is fast and reproducible but not semantic; it can miss synonyms and can be gamed by keywords. A semantic evaluator should be added only behind the same schema and should cite specific submission excerpts.

## Trade-offs

- Structured text is less expressive than UML or code, but quick to implement, accessible, easy to save, and sufficient to reveal reasoning.
- `localStorage` keeps setup friction and infrastructure low; the corresponding limitation is browser-local, non-account history.
- Synchronous deterministic review keeps the two-day prototype reliable. If AI review is introduced, persist before evaluation, show evaluating/failed state, prevent duplicate evaluation, and allow retry without losing the submission.
- A static monolith is appropriate. The first component to separate at higher usage would be slow evaluation, not the problem catalog or UI.

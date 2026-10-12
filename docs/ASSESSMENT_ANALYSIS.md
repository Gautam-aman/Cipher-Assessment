# Assessment analysis

## Summary

Build a focused, demonstrable low-level design practice loop. Learners choose a problem, design in a suitable format, submit, receive useful feedback, review prior attempts, and try again. This is a two-day domain-design/product exercise, not a production LMS or a high-scale architecture exercise.

## Functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| F1 | Offer a small set of contextualized LLD problems. | At least three selectable prompts provide scope, requirements, and a change prompt. |
| F2 | Let a learner create a meaningful attempt in one chosen format. | The evaluated LLD submission captures requirements/assumptions, classes/responsibilities, relationships/flow, and trade-offs/edge cases. A separate HLD canvas supports visual practice but is not part of attempt scoring. |
| F3 | Submit an attempt and expose its state. | Incomplete attempts are rejected with actionable missing-field guidance; valid attempts are saved as completed. |
| F4 | Give useful, explainable design feedback. | Review presents criteria, scores, evidence, and actionable suggestions; it does not claim a canonical answer. |
| F5 | Preserve and review attempt history. | Learner can see previous attempts and reopen a past review; can start a fresh attempt. |
| F6 | Keep important domain behavior clear and extensible. | Problem, attempt, validation, evaluation, and persistence responsibilities have clear boundaries; evaluation can be swapped behind a stable result shape. |

## Nonfunctional requirements

- Fit a two-day prototype scope and prioritize the learning loop.
- Make setup simple and interaction responsive and accessible.
- Avoid losing drafts on ordinary navigation/reload when browser storage works.
- Handle invalid input and browser storage failure without silently claiming persistence.
- Keep feedback explainable and grounded in submitted evidence.
- Include tests for key behavior and edge/failure cases.

## Technology constraints

The assessment specifies no mandatory language or framework. A buildless browser application with native JavaScript modules and a small Node static server is selected to minimize setup and keep the prototype self-contained. No account, backend, external AI key, database, or network service is required. Google Fonts are an optional visual enhancement; system fallbacks are declared.

## Evaluation criteria

| Area | Weight | Product response |
| --- | ---: | --- |
| Problem understanding & research | 15% | Focused research note and learner-centered product direction. |
| Product thinking / creativity | 15% | Explicit practice loop, narrow submission structure, and change prompt. |
| LLD / domain design | 25% | Distinct problem, attempt, validation, evaluation, and persistence responsibilities. |
| Evaluation & feedback | 15% | Six-dimension evidence-based rubric with actionable next steps. |
| Extensibility & engineering judgement | 10% | Evaluation result contract and separation of transport/UI, rules, content, and storage. |
| Implementation quality | 10% | Small dependency-free app, responsive UI, safe text rendering, clear states. |
| Testing & reliability | 5% | Automated domain tests cover invalid, valid, and whitespace submissions. |
| AI usage | 5% | The AI usage note records material suggestions, choices, and rationale. |

## Submission requirements

- 1–2 page research note.
- Concise design note covering MVP, user flow, classes/interfaces, evaluation, and trade-offs.
- Working end-to-end prototype.
- Tests for important behavior and failure/edge cases.
- README and AI usage note. The candidate requested these be combined into one `README.md`; this preserves the content but may not satisfy an evaluator that checks for a separate `AI_USAGE.md` filename.
- Submit completed work using the Google Form linked in the assessment. (External submission is not performed from this workspace.)

## Requirement-to-implementation traceability

| ID | Implementation | Verification | Acceptance |
| --- | --- | --- | --- |
| F1 | `src/problems.js`, problem picker and brief in `index.html` / `src/app.js` | Manual workflow + problem data review | Three distinct prompts expose requirements and an extension. |
| F2 | `index.html` structured form, `src/hld.js`, autosave in `src/app.js` | Domain tests + manual browser workflow required | Four LLD text sections are evaluated. HLD canvas is separately saved and exported, but not attached to attempts. |
| F3 | `src/evaluation.js` validation; submit handler in `src/app.js` | `npm test` + manual incomplete/complete submission | Missing sections give feedback; valid submission creates a completed attempt. |
| F4 | `src/evaluation.js` and `renderFeedback` in `src/app.js` | Rubric unit tests + manual review inspection required | Six section-aware criteria show score, matching draft excerpts, and a targeted next step. Cues remain lexical rather than semantic. |
| F5 | `src/storage.js`, history rendering and handlers in `src/app.js` | Manual repeat/reopen/reload check | Attempts persist locally and past review can be revisited. |
| F6 | `src/problems.js`, `src/evaluation.js`, `src/storage.js`, `src/app.js` | Code review + tests | Content, rubric, persistence, and view code remain independently replaceable. |

## Risks and assumptions

- LLD attempts use structured text; the additional HLD canvas is a separately saved artifact and is not included in attempt snapshots, review, or presentation mode.
- The evaluator uses deterministic, section-aware rubric cues and displays matching excerpts, not an LLM. It is transparent and works offline, but lexical cues can miss equivalent wording or reward a cue without semantic quality. Feedback explicitly describes this limitation.
- Attempts and drafts are local to one browser profile/device. No account, sync, or server persistence is required by the brief.
- Evaluation completes synchronously in the prototype. The state/result contract admits `submitted`, `evaluating`, `completed`, and `failed` if slow external evaluation is later introduced.
- Research is a brief product scan, not a comprehensive market study; source claims are limited to what publicly available product pages describe.
- The assessment form is the candidate's submission mechanism, but this project does not submit on the user's behalf.

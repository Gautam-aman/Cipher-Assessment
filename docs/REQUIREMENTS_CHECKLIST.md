# Requirements checklist

| Requirement | Implementation | Evidence / status |
| --- | --- | --- |
| Three contextualized LLD problems | `src/problems.js`, prompt picker and brief in `index.html` / `src/app.js` | Three distinct problems include requirements and a change prompt. Data inspected; manual browser selection still needs verification. |
| Meaningful LLD submission | Four sections in `index.html`; draft handling in `src/app.js`; persistence in `src/storage.js` | Captures assumptions, responsibilities, flow, and trade-offs. Domain validation is covered by tests; browser draft reload workflow is not automated. |
| Validate and submit attempts | `src/evaluation.js`; submit handler in `src/app.js` | Incomplete/whitespace validation and valid attempt behavior covered by `npm test`. Browser workflow remains to be manually verified. |
| Explainable feedback | Section-aware rubric in `src/evaluation.js`; rendering in `src/app.js` | Six criteria display relevant draft excerpts and next steps. Tests cover challenge-specific coverage, irrelevant repeated terms, and section separation. Heuristic remains non-semantic. |
| History and revision | `src/storage.js`, history and revision handlers in `src/app.js` | Attempt snapshots, linked revisions, revision focus, and key notes persist locally. Storage serialization is tested; browser reopen/reload flow is not automated. |
| HLD architecture canvas | `src/hld.js`, HLD section in `index.html` | Challenge templates, drag, connect, rename, delete, undo, local autosave, and SVG export are implemented. No browser automation currently verifies pointer interaction or exported rendering. Diagram is separate from evaluated attempts. |
| Research, design, AI usage notes | `docs/RESEARCH_NOTE.md`, `docs/DESIGN_NOTE.md`, `README.md#ai-usage` | Content is present. AI usage is merged into README as requested; a strict filename check for `AI_USAGE.md` may fail. |
| Tests and failure cases | `tests/evaluation.test.js`, `tests/storage.test.js`, `tests/vending.test.js` | Current run: 14 passed, 0 failed. Covers domain logic, inaccessible/quota storage, scoring signals, and vending state transitions; not full browser workflows. |
| Setup and limitations | `README.md` | Run/test instructions, hosted demo link, local data behavior, deterministic evaluator limits, and HLD submission boundary are documented. Hosted URL returned HTTP 200, but currently serves the older substring scorer rather than this working tree. |

## Remaining verification

- Manually verify challenge selection, draft save/reload, submit/review, history reopen, revision workflow, canvas drag/connect/undo/export, and reduced-motion behavior in a browser.
- Check desktop and mobile viewport fit and inspect browser console/network errors on the hosted deployment.
- Confirm whether the assessment accepts the AI usage note inside `README.md` or requires the exact `AI_USAGE.md` filename.

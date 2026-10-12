# Submission readiness report

## Product scope

Blueprint is a browser-local LLD practice studio with three prompts, a structured four-part design form, draft autosave, six-part deterministic review, attempt history, revision focus, and per-challenge key notes. Its separate HLD canvas provides challenge starter diagrams, move/connect/rename/delete/undo, autosave, and SVG export. HLD diagrams are not attached to LLD attempts or evaluated. The interface uses a white architecture-studio visual system and a reduced-motion path.

**Demo URL provided by the project owner:** [https://inspiring-zuccutto-2bff94.netlify.app/](https://inspiring-zuccutto-2bff94.netlify.app/). The URL returned HTTP 200 during this review and contains the canvas/revision UI. However, its served `src/evaluation.js` still has the former global `text.includes(term)` scorer; it does not match the improved local working tree. Re-deploy the current tree before presenting the live site.

## Engineering and verification

- Content, validation/evaluation, persistence, vending state machine, 3D previews, and HLD editor have separate modules.
- The evaluator now checks challenge-specific requirement cues, rubric-relevant answer sections, and displays matching answer excerpts. It remains lexical and can miss synonyms or reward a cue without sound design reasoning.
- `npm test`: **14 passed, 0 failed** on the recorded run. Tests cover submission validation, score signals and section separation, persistence errors/round-tripping, and vending state transitions.
- `node --check` for each `src/*.js` module and `server.mjs`: passed on the recorded run.
- `git diff --check`: passed on the recorded run.
- `npm audit --omit=dev --audit-level=moderate`: **0 vulnerabilities** in production dependencies.
- Interactive browser workflows, WebGL motion, narrow-screen layout, canvas dragging/connecting, exported SVG rendering, and browser console behavior remain unverified. Safari WebDriver is installed but session creation is disabled until “Allow remote automation” is enabled in Safari settings. Run these checks manually before a live assessment.
- No production build or deployment command exists; the app is served as native modules by `server.mjs`. Data is localStorage scoped to one browser profile.

## Assessment risks still visible

1. **The live deployment is behind the local tree.** It still serves the old substring-based evaluator. Redeploy and confirm the deployed source before the candidate demo.
2. **Browser-level proof is missing.** Automated tests do not exercise the end-to-end UI or new HLD pointer interactions; this is the largest remaining verification gap after deployment parity.
3. **AI usage packaging.** The assessment analysis records a requirement for a separate `AI_USAGE.md`, but the candidate asked for that content to be combined into `README.md`. Confirm the grader accepts the merged format.
4. **HLD attempt boundary.** Diagrams autosave separately and do not travel with an attempt, review, or presentation. The demo must not imply they are graded or historically snapshotted.
5. **Heuristic review.** The deterministic evaluator is explainable, tested, and labeled, but is not semantic assessment of design quality.

## Candidate presentation

Demonstrate the full LLD loop with one prompt, one incomplete attempt, one completed attempt, evidence excerpts, history reopen, and a new revision. Then demonstrate the HLD board separately and clearly explain that diagrams are saved per challenge but are not part of the scored attempt. Explain the trade-off behind local-only storage and lexical evaluation.

The project does not submit the candidate's work to the external assessment form.

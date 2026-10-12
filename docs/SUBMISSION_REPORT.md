# Submission report

## What was built

Blueprint is a single-screen LLD practice studio with three prompts, structured text design notes, local autosave, deterministic feedback over six design dimensions, and browser-local attempt history.

The interface now follows the Midnight Studio direction: deep navy and charcoal surfaces, violet-to-cyan accents, an atmospheric design-loop hero, challenge mission cards with real attempt status, a collapsible desktop rail, horizontal small-screen challenge navigation, and editor section readiness feedback. Motion is transition-led and reduced-motion aware. See [the design audit](DESIGN_AUDIT.md).

## Engineering decisions

- Kept the app a static monolith with small modules because the assignment prioritizes LLD domain boundaries over infrastructure.
- Separated prompt content, pure validation/evaluation, UI coordination, and persistence.
- Stored immutable attempt snapshots before displaying feedback.
- Returned evidence and next-step guidance per rubric criterion instead of presenting an unexplained score.
- Avoided credentials and remote dependencies for predictable local execution.
- Added a concise frontend audit and design plan in `docs/DESIGN_AUDIT.md`; kept the implementation dependency-free.

## Verification

- `npm test`: **6 passed, 0 failed**. Covers valid and incomplete submissions, whitespace input, rubric evidence, malformed stored data, storage write failure, and storage round-trip.
- `node --check` on `server.mjs` and all application modules: **passed**.
- Local server asset smoke check: **passed**. The page, stylesheet, application module, and problem data returned HTTP 200. The font stylesheet and font host are now explicitly allowed by CSP; scripts remain self-hosted.
- Local server smoke check: **passed**. `npm start` started at `http://127.0.0.1:4173`; `curl` received HTTP 200 for the page and application module, with the configured content security and MIME headers.
- After the redesign, port 4173 was already occupied; the updated app was started on port 4174 instead. `curl` received HTTP 200 for the page, stylesheet, app module, and problem data.
- Midnight Studio smoke check on port 4175: **passed**. Page, stylesheet, app module, and problem data returned HTTP 200; security headers allow the already-used Google Fonts stylesheet/font while keeping scripts self-hosted.
- Interactive browser workflow, screenshots, and visual checks at desktop/tablet/mobile sizes: **not verified** because no browser-control tool or local browser executable is available in this environment. The responsive breakpoints were reviewed in source; the prototype is ready for a reviewer to exercise locally.

## Limitations

The evaluator is deterministic and cue-based, not semantic. History is local to one browser. Submissions are text only. There is no deployed URL or cross-device account.

## Submission instructions

Run `npm start`, then `npm test`. Submit the completed assessment through the Google Form linked in the assessment document. No form response or deployment is claimed by this report.

# Submission report

## What was built

Blueprint is a single-screen LLD practice studio with three prompts, structured text design notes, local autosave, deterministic feedback over six design dimensions, and browser-local attempt history. Each challenge includes a lazy-loaded procedural Three.js preview with purposeful motion and button controls that also work through a non-WebGL fallback. The vending machine demonstrates selection, simulated payment, animated dispensing, and reset; the elevator moves between floors and animates its doors; the parking demo cycles vehicles through bays with pause and reset controls. Scroll reveals and a document progress line add motion to the workspace. See [motion verification](MOTION_VERIFICATION.md) for implementation details and browser verification limits.

The interface now follows the Midnight Studio direction: deep navy and charcoal surfaces, violet-to-cyan accents, an atmospheric design-loop hero, challenge mission cards with real attempt status, a collapsible desktop rail, horizontal small-screen challenge navigation, and editor section readiness feedback. Motion is transition-led and reduced-motion aware. See [the design audit](DESIGN_AUDIT.md).

## Engineering decisions

- Kept the app a static monolith with small modules because the assignment prioritizes LLD domain boundaries over infrastructure.
- Separated prompt content, pure validation/evaluation, UI coordination, and persistence.
- Stored immutable attempt snapshots before displaying feedback.
- Returned evidence and next-step guidance per rubric criterion instead of presenting an unexplained score.
- Avoided credentials and backend infrastructure. Three.js is the only runtime package dependency and is served locally.
- Added a concise frontend audit and design plan in `docs/DESIGN_AUDIT.md`.

## Verification

- `npm test`: **9 passed, 0 failed**. Covers evaluation, storage behavior, and the vending purchase state machine.
- `node --check src/app.js`, `src/scene.js`, `src/vending.js`, and `server.mjs`: **passed**.
- Local HTTP smoke check on port 4181: **passed**. The page, stylesheet, app, scene, vending model, and locally served Three.js module returned HTTP 200 with expected MIME types.
- No production build command is configured; this is a native JavaScript static app served directly by `server.mjs`.
- Interactive browser workflow, screenshots, and visual checks at desktop/tablet/mobile sizes: **not verified** because no browser-control tool or local browser executable is available in this environment. Responsive breakpoints were reviewed in source.

## Limitations

The evaluator is deterministic and cue-based, not semantic. History is local to one browser. Submissions are text only. The vending interaction simulates payment without a payment system. There is no deployed URL or cross-device account.

## Submission instructions

Run `npm start`, then `npm test`. Submit the completed assessment through the Google Form linked in the assessment document. No form response or deployment is claimed by this report.

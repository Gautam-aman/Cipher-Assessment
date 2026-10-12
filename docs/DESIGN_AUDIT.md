# Design audit — Midnight Studio

## Existing app

- **Screens/routes:** one responsive practice screen; no router or secondary route.
- **Structure:** semantic HTML template, one native JS module coordinating view state, small problem/evaluation/storage modules, a procedural WebGL scene module, and one tokenized stylesheet.
- **Dependencies:** Three.js for procedural preview geometry; Node built-in static server and test runner. No React or animation library, so native CSS motion and Three.js are used directly.
- **Workflows:** choose one of three problems → explore its model → write four-part text design → deterministic rubric review → inspect a presentation view → revisit local attempt history / begin again. Drafts and attempts use versioned localStorage.
- **Assessment constraints:** preserve problem context, meaningful submission, submission status, explainable non-canonical feedback, history, extensible evaluator boundary, research/design docs, and tests. This stays a small local monolith.

## Main design issues

Before this redesign, the app had a static hero illustration rather than a challenge preview and no presentation mode or keyboard shortcuts. The Midnight palette and mission cards existed, but needed to become an actual learning surface with real challenge-specific models. Feedback is intentionally deterministic and must remain labeled honestly.

## Implementation plan

1. Preserve the Midnight Studio visual system while turning the hero into a lazy-loaded Three.js preview.
2. Procedurally model the three existing problems; enable drag/keyboard orbit, parking-bay highlight, vending purchase simulation, and elevator floor requests.
3. Keep equivalent button-based preview actions and a static challenge illustration available when WebGL is unavailable.
4. Add a presentation dialog over the current draft or a submitted attempt, plus keyboard shortcuts and focus handling.
5. Keep local autosave, section readiness, rubric, history, reduced-motion handling, renderer pixel-ratio cap, offscreen pause, and resource disposal.
6. Retest domain behavior, syntax, dependencies, and static serving. Browser screenshots depend on installed browser tooling.

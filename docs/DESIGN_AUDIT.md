# Design audit — Midnight Studio

## Existing app

- **Screens/routes:** one responsive practice screen; no router or secondary route.
- **Structure:** semantic HTML template, one native JS module coordinating view state, small problem/evaluation/storage modules, single global stylesheet.
- **Dependencies:** no runtime packages; Node built-in static server and test runner. No animation library.
- **Workflows:** choose one of three problems → write four-part text design → deterministic rubric review → revisit local attempt history / begin again. Drafts and attempts use versioned localStorage.
- **Assessment constraints:** preserve problem context, meaningful submission, submission status, explainable non-canonical feedback, history, extensible evaluator boundary, research/design docs, and tests. This stays a small local monolith.

## Main design issues

The former light green palette and green banner did not match the requested Midnight Studio direction. Problem selection felt like a generic list rather than challenge choice; input hierarchy and completion feedback were quiet; the overview and editor lacked cohesive surface and interaction states. The narrow mobile picker was functional but needed stronger selected-state and focus treatment. The feedback is intentionally deterministic and must remain labeled honestly.

## Implementation plan

1. Rebuild the design tokens and surfaces around midnight navy, charcoal, violet, and cyan.
2. Refine the shell and add a real collapse/expand affordance for the desktop challenge rail; use a horizontal challenge picker on small screens.
3. Recompose the hero as a studio header with an illustrative practice loop, not a separate marketing page.
4. Make challenge cards carry real difficulty, duration, and attempt state from existing data.
5. Improve the writing workspace with section completion feedback, comfortable dark inputs, and clearer focus/validation states.
6. Preserve the existing rubric and history semantics; improve their hierarchy and empty states without inventing user metrics.
7. Add short, transform/opacity-led motion and reduced-motion handling; verify tests and server assets. Interactive browser screenshots depend on an installed browser tool.

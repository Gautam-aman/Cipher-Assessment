# Blueprint — LLD practice, made deliberate

Blueprint is a focused low-level design practice prototype. Choose a prompt, explain your design, submit it for a transparent rubric review, and revisit earlier attempts to improve your reasoning.

## Features

- Three contextualized LLD problems: parking lot, vending machine, and elevator system.
- Structured text submission for assumptions, responsibilities, relationships, trade-offs, edge cases, and tests.
- Browser-local draft autosave and attempt history.
- Six-part review with scores, visible evidence cues, and specific improvement prompts.
- Responsive, keyboard-operable interface with progress feedback, restrained motion, reduced-motion support, validation, and storage fallback states.

## Stack and architecture

Native JavaScript modules, HTML, and CSS; a tiny Node.js static server; Node's built-in test runner. There are no runtime dependencies, backend, API keys, or build step. See [architecture](docs/ARCHITECTURE.md), [design note](docs/DESIGN_NOTE.md), and [research note](docs/RESEARCH_NOTE.md).

## Prerequisites

- Node.js 20 or later.
- A modern browser with JavaScript enabled.

## Run locally

```sh
npm start
```

Open <http://127.0.0.1:4173>. Set `PORT` to use another local port.

## Tests

```sh
npm test
```

The test suite checks incomplete and whitespace-only submissions, valid rubric results, evidence, and actionable feedback. Browser layout and persistence are not represented as automated end-to-end tests.

## How to demo

1. Select a challenge in the left rail.
2. Fill all four design-note sections and submit.
3. Review the six dimensions, then submit another attempt or reopen a previous review from history.
4. Reload the page to see browser-local drafts and attempts persist.

## Design decisions and trade-offs

- Structured text is the smallest accessible format that captures design intent and rationale. UML and code are not implemented.
- Required content checks are deterministic. Rubric cues are deterministic too, so the demo is reliable and needs no secrets, but the evaluation is not semantic and can miss good designs phrased without its cues.
- Data stays in localStorage in the current browser profile. There is no account, backend, sync, or cross-device history.
- Review is synchronous in this prototype. A future slow evaluator should save first and expose submitted/evaluating/completed/failed states.
- Google Fonts enhance the visual style when online; system font fallbacks keep the app usable offline.

## Deliverables

- [Assessment analysis](docs/ASSESSMENT_ANALYSIS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Research note](docs/RESEARCH_NOTE.md)
- [Design note](docs/DESIGN_NOTE.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Requirements checklist](docs/REQUIREMENTS_CHECKLIST.md)
- [AI usage](AI_USAGE.md)
- [Submission report](docs/SUBMISSION_REPORT.md)

The assessment's final submission step is a Google Form. This workspace project does not submit to the external form.

# Blueprint — LLD practice, made deliberate

Blueprint is a focused low-level design practice studio. Choose a prompt, explain your design, submit it for a transparent rubric review, and revisit attempts to improve your reasoning.

## Features

- Three contextualized LLD challenges: parking lot, vending machine, and elevator system.
- A lazy-loaded Three.js preview with procedural geometry, drag orbit, keyboard orbit, and challenge-specific interactions.
- A continuously moving 3D preview, looping parking demo with pause/reset, animated vending dispense and reset, and elevator travel with door motion.
- Editorial headline entrance, pointer-reactive challenge gallery, LLD concept marquee, native-scroll section reveals, and a document progress line.
- Accessible preview controls and a static SVG fallback when WebGL is unavailable.
- Structured text submission, browser-local drafts, and attempt history.
- Revision workflow that reloads a past submission as a linked new attempt, plus per-challenge revision goals and dated key notes.
- Real score trend bars and review-driven revision targets based on each attempt's lowest rubric dimensions.
- Six-part deterministic review with evidence cues and specific improvement prompts.
- Presentation mode for the current draft or most recently reviewed submission.
- Architecture studio design with a white drafting-paper canvas, collapsible desktop rail, responsive mobile challenge picker, reduced-motion support, and draft readiness feedback.

## Stack and architecture

Native JavaScript modules, HTML, and CSS; Three.js for procedural preview models; a small Node.js static server; Node's built-in test runner. There is no backend or API key. Three.js is imported only when the hero preview enters view. See the [architecture](docs/ARCHITECTURE.md), [design note](docs/DESIGN_NOTE.md), [research note](docs/RESEARCH_NOTE.md), and [design audit](docs/DESIGN_AUDIT.md).

## Prerequisites and run

- Node.js 20 or later.
- A modern browser. WebGL is optional; the static preview remains available without it.

```sh
npm install
npm start
```

Open <http://127.0.0.1:4173>. Set `PORT` to use another local port.

## Shortcuts and demo

1. Choose a challenge; orbit its model by dragging or focus the canvas and press the arrow keys.
2. Use the preview actions to highlight a parking bay, simulate a vending purchase, or request an elevator floor.
3. Fill the four design-note sections. Drafts autosave in this browser.
4. Submit with the button or `Ctrl/⌘ + Enter`, then review the six dimensions and attempt history.
5. Open presentation mode with the top-right button or `Ctrl/⌘ + Shift + P`. Save with `Ctrl/⌘ + S`.

## Tests

```sh
npm test
```

The suite covers incomplete/valid submission, rubric feedback, malformed storage, failed storage writes, state round-tripping, and vending transaction behavior. It does not automate browser/WebGL workflows.

## Design decisions and limits

- Three.js is used directly instead of React Three Fiber because this is a dependency-light vanilla JavaScript app. Models are procedural and assets are not downloaded.
- Rendering is capped at 1.5 device pixel ratio, throttled to about 30 fps, paused when offscreen, and disabled for reduced-motion users. Scene geometries and materials are disposed on model changes.
- Preview buttons mirror key model interactions for keyboard and non-WebGL use. The vending flow is explicitly a local simulation; it does not process payment.
- Scroll reveals and the document progress line use native scroll and `IntersectionObserver`; no scroll hijacking is used. See [motion verification](docs/MOTION_VERIFICATION.md) for checks and browser verification limits.
- The [reference notes](docs/MOTION_REFERENCE.md) record which Visuvate cues were available and which live interactions could not be inspected here.
- Structured text is the chosen submission format; UML/code editing is not implemented.
- Feedback cues are deterministic and transparent, but they are not semantic evaluation and may miss equivalent wording.
- Data stays in localStorage for this browser profile. There is no account, backend, sync, or cross-device history.

The assessment's final submission step is a Google Form. This workspace does not submit to it.

# Motion verification

## Implemented motion

The Three.js preview now advances at about 30 frames per second while visible and motion is allowed. The architecture rotates continuously; four faceted nodes float with animated connector endpoints; cursor position offsets the model; and ambient light changes slowly. The parking simulation moves the cars through an 8 second enter, park, and exit loop, with pause, resume, and reset controls. Vending selection and payment update the state; dispensing animates the selected item to the tray, and reset restores all products. Elevator requests move the cabin, open the paired doors on arrival, and close them again. The interface also reveals workspace cards on entry, shows a scroll progress line, and animates challenge selection and controls.

## Verification results

| Animation | Trigger | Expected movement | Verification result |
|---|---|---|---|
| Hero 3D scene | Continuous while visible | Rotating model, floating nodes, moving connector endpoints, changing light | Implemented in `src/scene.js`; browser frame comparison unavailable in this environment, so runtime motion is not claimed as browser verified. |
| Parking simulation | Demo enabled by default | Cars enter, park, and leave; pause/resume and reset controls | Implemented in the scene update loop and controls; not browser verified. |
| Vending machine | Select, simulate payment, dispense, or reset | State updates and selected product animates into the tray | Shared state behavior covered by Node tests; the Three.js animation is not browser verified. |
| Elevator | Select a floor button | Cabin moves, doors open on arrival, floor indicator responds | Implemented in the scene update loop; not browser verified. |
| Navigation | Select or hover a challenge | Active accent enters, card and icon respond | CSS transitions and active state implemented; not browser verified. |
| Scroll | Workspace card enters viewport | Card reveals and top progress line follows document scroll | `IntersectionObserver` and native document scroll listener implemented; not browser verified. |
| Reduced motion | OS/browser reduced-motion preference | Continuous scene loop and CSS motion are suppressed; controls still change state | Preference handling is implemented in `src/scene.js` and `styles.css`; not browser verified. |

## Checks run

- `npm test`: 9 passed, 0 failed. This includes the vending state machine but does not test WebGL.
- `node --check src/app.js` and `node --check src/scene.js`: passed.
- Local HTTP smoke check previously confirmed the app and locally served Three.js modules return HTTP 200. It does not verify rendering.
- No browser executable or browser automation tool is available in this environment. Console output, multi-frame pixel comparisons, viewport behavior, and reduced-motion behavior therefore remain unverified in a real browser.

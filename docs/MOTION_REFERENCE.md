# Motion reference notes

## Reference access

The requested reference is [Visuvate](https://www.visuvate.com/). The web search tool returned indexed page content, but a direct open of the site failed and this environment has no interactive browser tool. I could not inspect its live load sequence, hover responses, drag gestures, cursor behavior, mobile interactions, or animation timing. This document does not claim those effects were observed.

The indexed page content describes a bold hero, a portfolio/work gallery, service and platform sections, and an approach/story section. Visuvate's site also describes motion and interaction design as one of its offerings. These content and structure cues inform Blueprint's original direction; the mapping below is a design interpretation, not a reproduction of verified reference behavior.

| Available reference cue | Blueprint application | Rationale |
|---|---|---|
| Bold, high-impact hero messaging in indexed home-page content | Three-line “THINK. DESIGN. EVOLVE.” headline with masked upward entrance | Gives the practice product a clear editorial voice before the workspace details. |
| Work and project gallery content | Three large challenge panels with pointer tilt, reactive lighting, active state, and direct entry | Turns the existing challenge catalog into an exploratory entry point while keeping every prompt reachable by button and keyboard. |
| Multiple sections covering approach and platform flexibility | Challenge gallery, concept marquee, prompt, editor, review, and history form a native-scroll learning journey | Adds narrative rhythm without trapping the user in a forced intro. |
| Motion and interaction design is explicitly part of the reference studio's service list | Lightweight CSS and DOM interactions, existing purposeful Three.js previews, reduced-motion rules | Applies motion where it clarifies navigation or learning state; no animation package is added to this vanilla JavaScript app. |

## Blueprint motion system

- Entrance: staggered headline lines, support copy, CTA, and preview with short CSS animations. There is no blocking preloader.
- Navigation: active challenge state remains available in the sidebar and the gallery; selection updates both and preserves per-challenge drafts.
- Gallery: pointer-position lighting and a small perspective tilt on desktop; standard buttons and natural vertical scrolling on touch screens.
- Marquee: a seamless strip of LLD concepts that pauses on hover and stops for reduced-motion preferences.
- Scroll: native document scrolling, `IntersectionObserver` reveals, and a thin document progress line. No scroll hijacking or nested scroll container is introduced.
- Editor: existing autosave, field focus feedback, and readiness progress remain intact; text does not animate while typing.

## Verification limits

The live reference animation and Blueprint's rendered effects could not be browser-inspected in this environment. For current source checks and what was or was not browser verified, see [motion verification](MOTION_VERIFICATION.md).

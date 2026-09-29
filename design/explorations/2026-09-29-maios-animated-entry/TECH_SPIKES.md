# Technology spikes

Status: candidate exploration only.

## Spike A — layered SVG / 2.5D field

Goal: reproduce the perceptual depth of the supplied horizon reference while staying deterministic and lightweight.

Mechanism:

- 3–5 authored SVG/CSS depth planes;
- `transform: translate3d(...)` / `perspective` for subtle parallax;
- pointer input sampled through one requestAnimationFrame loop;
- bounded scroll response through ordinary JS with feature-detected enhancement;
- text and controls outside the raster/vector art.

Why this is the baseline:

- exact MAIOS content remains editable;
- the motion can degrade to a static composition;
- transform/opacity-heavy movement fits the existing web quality and cognitive-motion contracts;
- no WebGL dependency is required to prove the concept.

## Spike B — horizon -> structured field

Goal: make the landing feel specifically MAIOS rather than merely scenic.

Candidate event:

```text
layered horizon
-> one relation becomes salient
-> a small number of vectors / nodes appear from the field
-> the visitor reaches real entry choices
```

The vectors must have a declared predicate or remain atmospheric. Do not use connector lines merely to suggest conceptual relatedness.

Use a same-document View Transition only as progressive enhancement if it helps preserve the selected object's identity while the field reorganises.

## Spike C — bounded Three.js/WebGL depth test

Goal: test whether true camera/viewpoint depth contributes a relation that Spike A cannot express.

Allowed experiment:

- one canvas;
- one bounded hero;
- no remote 3D asset dependency;
- no continuous particle system unless it carries a real relation;
- DOM overlay retains all exact copy and actions;
- pause rendering when off-screen;
- static/reduced-motion equivalent.

Reject Three.js for the candidate if the same encounter is achieved by authored SVG/CSS with less complexity, or if the canvas becomes the primary reason the page appears distinctive.

## Browser / motion boundary

- `prefers-reduced-motion` must preserve the same state and action without panning/scale/parallax.
- CSS scroll-driven animation may be used only behind feature detection; it is not the sole path.
- View Transition API is progressive enhancement; unsupported browsers must reach the same semantic result.
- Prefer transform and opacity for frequent animation.
- Stop animation loops when the hero is not visible.

## Evaluation receipt

For each spike record:

```text
perceptual_thesis:
what_motion_reveals:
what_remains_exact_dom:
desktop_readback:
mobile_readback:
reduced_motion_readback:
false_relation_check:
performance_observation:
maintenance_cost:
keep / adapt / discard:
reusable_learning:
```

The first prototype should be judged at real viewport size, not from a still screenshot alone.

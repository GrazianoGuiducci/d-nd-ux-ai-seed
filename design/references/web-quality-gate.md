# Web Design Quality Gate

Status: cross-cutting competence contract, not a registry component.

Use this gate for web UI implementation, redesign, or quality review after the
surface owner and the smallest complete UX unit have been selected. It does not
replace the behavior contract of a promoted seed.

## Purpose

A visually coherent surface can still fail through unsupported design claims,
inaccessible controls, detached errors, fragile responsive behavior, or
expensive motion. Verify these qualities as one bounded pass before calling a
web surface ready.

## 1. Establish The Governing Evidence

Select one coherent product or page family. Trace only sources that reach the
rendered surface through imports, inheritance, resolved tokens, shared
components, or loaded styles.

Use this evidence order:

```text
accepted design guidance
-> named tokens, themes and shared primitives
-> representative rendered consumers
-> surface-local implementation
```

Do not promote repetition, an isolated literal, a screenshot impression, a
proposal, or a similarly named package into design intent.

For every review finding require:

```text
contract:
  the decision or visible contradiction that makes the issue real.

runtime:
  proof that the cited source reaches the selected surface.

correction:
  one deterministic change supported by the evidence.
```

If the evidence allows several incompatible corrections, report the ambiguity
instead of inventing product intent.

### Optional Design-Language Artifact

When a product needs persistent design context, create or update its existing
design-language artifact only from verified evidence. Use a compact private
ledger before writing:

```text
role -> value -> source -> scope -> recurrence -> confidence
```

Record governing roles and decisions, not every discovered value. Keep
page-local exceptions scoped to their page. Do not introduce an external token
schema or validation tool unless the selected project already owns that
contract.

## 2. Preserve Native Semantics And Accessible Names

- Prefer native `button`, `a`, `input`, `select`, `textarea`, list, heading and
  table semantics before adding roles.
- Give every interactive control an accessible name.
- Label icon-only controls and hide decorative icons from assistive
  technology.
- Keep heading order meaningful and link text understandable out of context.
- Do not use positive `tabindex`.
- Do not rebuild keyboard or focus behavior when the selected project's
  accessible primitives already provide it.
- Do not mix primitive systems inside one interaction surface.

## 3. Make Keyboard, Focus And Disclosure Recoverable

- Keep every interaction reachable and operable by keyboard.
- Show a visible focus state that is not encoded by color alone.
- Set `aria-expanded` and `aria-controls` on disclosure owners.
- Move focus into dialogs, drawers, or newly active reading planes when they
  open.
- Trap focus only inside modal surfaces.
- Close overlays with `Escape` when applicable and restore focus to the exact
  semantic owner.
- Remove closed drawers and latent controls from pointer, keyboard, and
  accessibility navigation.
- Provide a non-hover path for important tooltip or popover information.

For complex widgets, use established project primitives or their documented
behavior contract. A visually similar custom shell is not parity.

## 4. Attach Errors And Status To The Action

- Associate labels, help, and errors with their fields.
- Mark invalid controls with `aria-invalid` and connect the message through
  `aria-describedby`.
- Explain why a required action is unavailable; do not leave a disabled submit
  control as the only signal.
- Keep critical errors beside the decision or action that owns them.
- Use an appropriate live region or status role for asynchronous results that
  must be announced.
- Do not use a toast as the sole carrier of critical information.
- Never block paste in a text field.
- Invalidate derived previews or completion indicators when their source input
  changes.

## 5. Verify Responsive Geometry And Reading

Check the viewports required by the selected seed and at least one tall/narrow
and one wide desktop case.

- Use dynamic viewport units where full-height behavior matters.
- Respect safe-area insets for fixed controls and bottom action bars.
- Prevent full-page horizontal overflow.
- Keep primary actions and required controls inside the usable content box.
- Let long labels wrap or truncate intentionally.
- Preserve semantic order when desktop geometry becomes a drawer, stack, or
  linear equivalent.
- Keep data readable with tabular numerals where aligned comparison matters.
- Balance short headings and preserve comfortable paragraph wrapping only when
  the active stack supports those utilities or equivalent CSS.

Do not force Tailwind, a component library, or a new token system into a
project that already has an owner.

## 6. Apply A Motion Performance Budget

Default to `transform` and `opacity`. Batch DOM reads before writes and measure
geometry once per transition phase. Pause looping or observation-driven motion
when the surface is off-screen and preserve the same final state under
`prefers-reduced-motion`.

Avoid:

- continuous layout reads and writes in one frame;
- scroll-event animation driven directly by `scrollTop` or `scrollY`;
- unbounded `requestAnimationFrame` loops;
- large animated blur or backdrop-filter surfaces;
- persistent `will-change`;
- several animation systems measuring the same surface;
- inherited animated custom properties.

Layout or paint motion is allowed only when the selected behavior contract
needs semantic recomposition and all of these are true:

```text
the surface is bounded;
the start and end geometry are measured;
the motion has a stop condition;
the reading/focus consequence is explicit;
reduced motion reaches the same state;
rendered bounds are sampled when geometry correctness matters.
```

This exception preserves D-ND cognitive motion without treating every width,
height, color, or blur transition as harmless.

## 7. Keep State, Authority And Side Effects Visible

- Make loading, empty, error, selected, disabled, and completed states
  distinguishable without relying on color alone.
- Give an empty state one useful next action.
- Keep destructive or irreversible actions behind an explicit confirmation
  surface.
- Show whether an action is impossible, read-only, review-only, mutating,
  publishing, or destructive.
- Do not let appearance, view mode, or personalization broaden authority or
  data exposure.

## 8. Route Public Metadata Separately

For a public or shareable page, verify the handoff includes:

```text
document title and language;
description when the page is searchable/shareable;
canonical and robots intent;
Open Graph URL, title, description and absolute image;
favicon/manifest/theme-color when the product uses them;
structured data only when it matches rendered content.
```

Metadata ownership remains with the selected site communication, SEO, or
publishing adapter. Do not turn a UX-quality pass into an unrelated metadata
refactor, and do not invent public claims, ratings, prices, or organization
data.

## Review Output

For a quality review, return no more than the strongest supported findings:

```text
surface:
governing evidence:
finding:
contract proof:
runtime proof:
one correction:
affected scope:
validation:
```

It is valid to return no finding when the proof gate does not survive
falsification.

## External Signal And Adaptation Boundary

This contract was informed by the MIT-licensed
[`ibelick/ui-skills`](https://github.com/ibelick/ui-skills) repository,
reviewed at commit `ae74b58e722abe7ddf5948e07dd220808acce8a9`
(2026-07-23), especially its baseline, accessibility, motion-performance,
design-language, and evidence-led UI-review skills.

No upstream CLI, dependency, stack mandate, skill bundle, or source code is
vendored here. D-ND keeps the reusable principles in a stack-neutral contract
and preserves its own agentic orientation, cognitive-motion, authority, and
side-effect boundaries.

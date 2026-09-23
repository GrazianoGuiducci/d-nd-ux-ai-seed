# Context-Aware Guided Form Composition

Status: docs-only candidate behavior contract.

Origin evidence: the MAIOS Client Setup journey, the candidate Adaptive
Semantic Surface, and repeated operator review of focus, disclosure, contrast,
responsive recomposition and result boundaries. The source implementations are
evidence, not templates to copy.

## One-Sentence Contract

This pattern helps a person move from a situation they can recognize to one
useful, inspectable next result without requiring them to specify the solution
in advance.

It does not execute, submit, publish or persist work by itself. It becomes
misleading when a form collects profile labels without changing the result,
advances on selection, preserves stale dependent answers, or disguises an
external action as ordinary completion.

## Use When

Use this candidate when:

- a novice cannot yet formulate the correct request or solution;
- context, activity, present pressure and operating boundary change which
  outcomes are useful;
- the interface must suggest a small set of relevant possibilities with
  reasons;
- a multi-step form must remain understandable across desktop and mobile;
- review, generation, submission and execution require distinct authority.

Do not use it when:

- one independent field and one immediate result are sufficient;
- the questions exist only for segmentation or marketing attribution;
- the product cannot return a useful result for the offered category;
- hidden profiling would determine questions, defaults or visual treatment;
- the design depends on a specific brand palette or a copied screen.

## Smallest Complete Unit

The reusable unit is not the visible form. Carry these together:

```text
causal question graph
+ accepted / unknown / derived state
+ dependency invalidation
+ one-decision viewport montage
+ explicit continuation boundary
+ reversible disclosure and focus-frame stack
+ local surface / text contrast contract
+ terminal review and action-class boundary.
```

Copying cards, transitions or copy without this unit is an incomplete port.

## Five-Layer Assembly

Keep five layers distinct even when one component renders them:

```text
1. business situation
   person, current pressure, desired change, eligibility, exclusions and value;

2. semantic state
   accepted facts, unknowns, dependencies, derived proposals, authority and
   invalidation rules;

3. interaction composition
   orientation, causal bridge, active choice, continuation, progressive
   detail, focus owner, return path and terminal review;

4. expressive projection
   palette, atmosphere, local contrast, motion character, icons and density;

5. result compiler
   inspectable synthesis, proposed next movement, evidence, untouched
   territory, required approval, recovery and receipt.
```

Information moves downward only after acceptance or with a visible inference
label. Expression may clarify meaning; it must not change eligibility,
defaults, question order, authority, persistence or output.

## Build The Causal Question Graph

Start from the result the product can truthfully return, then ask only for
information that changes that result:

```text
current situation or domain
-> activity or active object
-> present effect or pressure
-> evidence and bases already available
-> people, data and authority boundary
-> eligible possibilities
-> first result worth verifying.
```

Apply these rules:

- Let role and competence level calibrate language, examples and support depth;
  never let either replace the live situation.
- Include a category only when the selected product can return a useful result
  for it. Buyer, supporter, observer and operator are different relationships,
  not automatically equivalent setup packages.
- Treat `not known yet` as a valid answer. Disable dependent controls, explain
  the missing prerequisite and serialize no stale value.
- Recompute or invalidate summaries, recommendations and generated results
  when an upstream answer changes.
- Keep suggested possibilities editable and label recommended, optional,
  advanced, unavailable and excluded states with reasons.
- Do not let friendly copy grant capability, access or permission that the
  product contract does not contain.

## State And Dependency Contract

Model accepted input separately from derived output:

```ts
type GuidedFormState = {
  accepted: Record<string, unknown>;
  unknowns: string[];
  derived: Record<string, unknown>;
  invalidated: string[];
  authority: 'local' | 'review-required' | 'external-action';
  activeStep: string;
  focusOwner: string | null;
};
```

When a prerequisite becomes empty or unknown:

1. disable each dependent control;
2. clear its accepted and derived values;
3. explain what enables it;
4. update open summaries from the same state transaction;
5. announce the changed state without moving keyboard focus unexpectedly.

Never preserve a hidden answer that the person can no longer inspect or
justify.

## Four-Plane Focus Montage

Compose every consequential step through four visual planes:

```text
1. orientation: where the person is;
2. causal bridge: why this answer changes the result;
3. active choice: the comparison or input to resolve now;
4. confirmation: the explicit continuation or action boundary.
```

The first three points guide attention in sequence. The fourth is normally the
CTA. Secondary summaries, art and controls remain adjacent only while they do
not compete with this sequence.

Selection changes the answer but does not advance. For pointer input, a settled
viewport may guide attention toward Continue with one restrained, non-repeating
accent. For keyboard input, keep focus among the choices until explicit
confirmation. Move focus to the next step only after the transition settles.

Do not add badges, labels or content that change selected-card dimensions.
Use border, local color, marker and shadow for acknowledgement while keeping
geometry stable.

## Natural Disclosure And Focus Transfer

A disclosure is a reversible focus transfer, not an expanding box effect.

Opening sequence:

```text
capture owner + viewport frame
-> mount inert destination
-> measure final geometry
-> begin calm structural expansion
-> reveal content after motion begins
-> align the disclosure title near the upper reading edge
-> focus the destination when stable
-> announce ready.
```

Closing sequence:

```text
mark destination inert
-> reverse the same geometry
-> restore the saved viewport frame
-> hide or unmount after motion completes
-> return focus to the exact owner or stable semantic fallback.
```

Use one coordinated scroll implementation. Do not combine native smooth
scrolling with a second animation loop. A practical timing scale is:

```text
control feedback: about 320ms
state change: about 560ms
disclosure: about 800ms
focus transfer: about 960ms
surface transition: about 1100-1200ms
starting easing: cubic-bezier(.2,.78,.18,1)
```

These are starting relationships, not universal constants. Distance, content
weight and viewport height may require adjustment. The movement must expose
origin, transformation and destination; it must never explode open, overshoot
the reading point or delay a real result for spectacle.

When an open summary changes, keep it mounted. Move the changed row temporarily
into the local reading focus, apply one short accent peak, then restore its
ordinary emphasis. Do not close and reopen the complete summary.

Honor `prefers-reduced-motion` by removing travel and delay while preserving
state order, framing and final focus ownership.

## Responsive Viewport Composition

Treat each step as `orientation -> active scene -> destination`.

- Keep the active decision and CTA in one viewport when content and readable
  target sizes reasonably permit it.
- Recompose wide comparisons into a semantic sequence on narrow screens; do
  not shrink desktop geometry with a global transform.
- Stack a dependent destination before side-by-side columns make the primary
  question too narrow.
- Make closed or zero-width surfaces intrinsically size-neutral before
  measuring the active scene.
- Use dynamic viewport units or `visualViewport` when browser chrome and zoom
  materially change the available frame.
- Preserve question order, selected state, summary meaning and action boundary
  across breakpoints.
- Use normal document flow when a readable step cannot fit; no-scroll is a
  product-shell option, not permission to clip or create nested scroll traps.

Verify at 375px, 768px, 1024px, 1366px, a wide desktop and at reduced viewport
heights approximating browser zoom. Repeat opening and closing from a
non-canonical scroll position.

## Contrast And Expression

Resolve every text-bearing region as an explicit `surface` / `on-surface`
pair. Do not rely on a global light, dark or hybrid theme to repair local
contrast.

- Normal text reaches at least 4.5:1; prefer about 7:1 for sustained reading
  when the field permits it.
- Meaningful borders, focus indicators, icons and paths reach at least 3:1;
  prefer about 4.5:1 where practical.
- A mathematical pass near the floor still requires rendered review; fields
  dominated by middle values can appear foggy.
- Disabled controls remain legible and visibly unavailable.
- State is never communicated by color alone.
- Atmosphere may adapt only from an explicit accepted signal, with a visible
  reason and a neutral or user-selected override.
- Empty-state art may establish atmosphere or direct attention, but it must not
  replace the missing explanation, option or next action.

The target product owns palette, type and imagery. The Seed owns their semantic
responsibilities and acceptance gates.

## Terminal Review And Action Classes

The final frame is a synthesis, not a second copy of the form. Reclaim space
previously used by step navigation or inspectors and show:

```text
point of departure
-> selected activity and present effect
-> evidence and operating boundary
-> proposed first result
-> explicit next action.
```

Keep detailed proposals progressively disclosed and editable. Distinguish:

```text
complete form: produce a local, inspectable representation;
generate: create a bounded artifact;
submit: transfer data to an identified receiver;
publish: change a public surface;
execute: act on a real system or external context.
```

Each higher action class requires its own preview, authority, recovery and
receipt. Ordinary completion must not imply an external side effect.

## Machine-Readable Orientation

Recommended public attributes:

```html
data-agent-marker="guided-form"
data-agent-active="true"
data-agent-focus="current-question-or-result"
data-agent-action="continue|review|generate|submit|publish|execute"
data-agent-boundary="local|review-required|external-action"
```

Optional state may use existing `data-agent-tab`, `data-agent-item`,
`data-agent-relation` and `data-agent-count`. Do not expose private answers,
hidden profiling or internal reasoning in attributes.

## Acceptance Matrix

Before reuse, verify:

```text
business:
  every offered category can produce a useful result;
  live pressure, not persona alone, controls the journey;

semantic:
  missing prerequisites disable and clear dependent answers;
  upstream changes invalidate derived state and open summaries;
  unknown, defer, correction and back paths preserve accepted context;

interaction:
  one active decision and its CTA are identifiable in about five seconds;
  selection does not auto-advance;
  opening and closing restore viewport and exact focus owner;
  reduced motion reaches the same state and focus result;

visual:
  selected state causes no reflow;
  every final text/surface pair passes its contrast target;
  mobile preserves decision order without horizontal overflow;

result:
  review summarizes rather than duplicates;
  action class, untouched territory, approval and recovery are explicit;
  no completion claim exceeds an observable receipt.
```

## Candidate Boundary And Promotion Gate

This is a docs-only candidate. It has no exported component and no independent
demo in this repository. Its current evidence comes from one MAIOS owner
surface and related synthetic design proofs.

Promote only after:

- one second real owner surface in a different domain uses the same causal and
  focus contracts with different copy and visual expression;
- a first-time user can explain why each consequential question appears;
- keyboard, screen-reader, reduced-motion and responsive checks pass;
- dependent-state invalidation and exact focus restoration have automated or
  recorded behavioral evidence;
- completion and any external action return distinct receipts;
- at least one correction from the second use is integrated into this
  contract.

Compact rule:

```text
ask only what changes the useful result;
selection changes state, confirmation changes step;
motion names origin and destination;
the summary preserves causality;
authority remains explicit.
```

## Candidate Extraction Receipt

```text
date: 2026-07-25
classification: seed_public_candidate
owner_surface: d-nd-ux-ai-seed
implementation_state: docs-only; no exported component
private_or_product_state_transferred: none
validated: both repository skills, registry structure, TypeScript typecheck,
  library build and package dry run
not_yet_validated: independent second-domain use, rendered browser behavior,
  novice comprehension and assistive-technology acceptance
publication: not performed
```

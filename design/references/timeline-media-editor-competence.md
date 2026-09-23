# Timeline And Media Editor Competence

Status: cross-cutting candidate contract, not a promoted registry component.

Use this reference when designing, implementing, or reviewing video, audio,
animation, subtitle, or other time-based editors. Pair it with the selected
product owner, domain model, and accessibility contract. It does not prescribe
a framework, renderer, media engine, or visual style.

## 1. Make Time Exact Before Making It Convenient

Use a canonical integer time unit in domain state and represent frame rate as a
rational value. Seconds, decimal frame rates, and formatted timecode are view
projections, not the source of truth.

```text
canonical time:
  integer ticks or an equivalent exact domain value.

frame rate:
  numerator / denominator, including fractional broadcast rates.

boundary conversion:
  round, snap, align, and format in one named place.

domain invariant:
  edits, history, collisions, ripple calculations, and serialization use the
  same exact representation.
```

Brand the type or otherwise prevent ordinary floating-point values from
silently re-entering the domain. Test invalid rates, fractional rates, negative
positions when disallowed, last-frame boundaries, and round trips.

## 2. Encode Timeline Topology In The Domain

Represent track categories, element categories, compatibility, and element
capabilities explicitly. Avoid one generic object whose optional fields allow
invalid states.

```text
topology:
  overlay, primary visual, audio, subtitle, marker, or product-specific lanes.

compatibility:
  which element kinds may enter each track and whether a new track is legal.

capabilities:
  trim, split, move, fade, volume, transform, group, lock, mute, or other
  operations valid for that element kind.
```

Keep pointer/drag state separate from persisted document state. Use stable
identity across selection, history, and rendering.

## 3. Treat One Gesture As One Reversible Intent

A user gesture should normally create one atomic history entry, even when it
causes secondary work such as creating a track, moving several elements, or
updating selection.

- Execute composite commands in declared order and undo them in reverse.
- Restore exact positions, durations, track membership, and selection intent.
- Keep preview state out of committed history until the gesture completes.
- Make drop, trim, split, ripple, delete, and group operations independently
  testable at their public command seam.
- Do not report undo support when it restores media but loses the user's
  working identity or creates a different track topology.

## 4. Preserve Direct-Manipulation Continuity

Direct manipulation should feel like contact with the represented object:

- preserve selected identity through drag, trim, resize, and drop;
- keep additive-selection modifiers consistent across click and marquee;
- constrain hit-testing to the correct track and visible interval;
- place trim handles outside or beside honest media bounds when overlaying them
  would misrepresent the visible extent;
- lift the active object above collisions and neighboring content;
- make snap override, collision stops, and invalid destinations visible;
- highlight the track that contains selected items;
- keep pointer motion immediate and reserve animation for the final settle.

Empty timeline space may seek the playhead only when it cannot be confused with
marquee selection, pan, or drop. Maintain a linear keyboard-accessible path for
selection and editing; pointer parity is not accessibility parity.

## 5. Separate Decision Kernels From State Application

Compute complex edits as explicit plans before mutating document state:

```text
placement input -> compatibility and overlap policy -> placement plan
ripple before/after -> vacated and occupied intervals -> adjustment plan
group transform -> member constraints -> movement plan
```

Apply a validated plan in a separate step. This makes policy testable without
DOM, renderer, store, or command-manager state. Before/after diffing is useful
only when domain time types, overlap semantics, and regression tests cover the
calculation; a pure-looking function with raw numeric units is still unsafe.

## 6. Render The Viewport, Not The Whole Source

For waveforms, thumbnails, markers, and dense time geometry:

- preprocess or cache a source summary once;
- map the visible time interval to the smallest required sample range;
- render only the visible interval plus bounded overscan;
- account for device pixel ratio without changing domain coordinates;
- skip work when a render signature is unchanged;
- invalidate caches when the media identity or relevant transform changes.

Measure long-source performance at zoom extremes, during scroll, and while
another gesture is active. A fast initial render does not prove interactive
performance.

## 7. Design Capability, Storage, And Migration Failure States

Media tools cross browser, GPU, codec, storage, and worker boundaries. Make
these states part of the product contract:

```text
capability unavailable or degraded;
GPU/renderer fallback;
unsupported import/export combination;
storage persistence denied or evicted;
interrupted export or migration;
old project schema requiring upgrade;
recoverable versus destructive failure.
```

Show a useful next action and preserve the project whenever possible. Test a
support matrix rather than inferring parity from one browser or desktop shell.

## 8. Validation Matrix

Before calling the editor behavior stable, cover:

```text
exact time and rational frame rates;
track/element compatibility and invalid placements;
atomic commands plus undo/redo state restoration;
selection identity across every gesture;
snapping, collision, trimming, grouping, and ripple boundaries;
visible-range rendering and long-media performance;
keyboard and screen-reader equivalent paths;
browser/GPU/codec/storage degradation;
project migration, interruption, and recovery.
```

## Architecture Maturity Boundary

An editor API, shared Rust core, plugin system, MCP server, headless renderer,
or scripting surface is a candidate architecture until its public contract is
reachable, exercised by real consumers, and covered by behavior tests. A shell,
roadmap, generated component catalog, or changelog claim is not implementation
proof.

## External Signal And Adaptation Boundary

This contract was distilled from the MIT-licensed
[`OpenCut-app/OpenCut`](https://github.com/OpenCut-app/OpenCut) rewrite at commit
`4d8c49ed0706c4dc145361e01c6b1f1a87cbb863` (2026-07-24) and the linked
[`OpenCut Classic`](https://github.com/OpenCut-app/opencut-classic) codebase at
commit `cf5e79e919144200294fb9fed22a222592a0aeea` (2026-05-17).

Only behaviors corroborated in Classic domain types, commands, placement
tests, selection/hit-testing, waveform rendering, or exact-time code were
promoted. Ripple planning remains a guarded candidate because the inspected
implementation still used unbranded numeric units and no dedicated regression
tests were found. The rewrite's plugin, MCP, headless, editor-API, and shared
core claims remain roadmap signals because its current product surfaces are
early placeholders. No upstream code, UI bundle, renderer, or dependency is
vendored.

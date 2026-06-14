# Shell3Col Workspace Seed

Status: reusable UX-AI workspace seed.
Primary component: `components/Shell3Col.tsx`.

## Purpose

`Shell3Col` is the default layout for dense agentic workspaces:

```text
left context -> main field -> right detail
```

It is for systems where the user must keep orientation while inspecting a live
field, selecting objects and reading consequences.

It is not for landing pages, articles or simple narrative flows.

## Anatomy

| Zone | Function | Typical content |
| --- | --- | --- |
| Left | Context / field | Filters, counters, current source, recent items, operational boundary. |
| Main | Active field | Graph, map, canvas, bicone, timeline, table, simulation. |
| Right | Detail / inspector | Selected object, candidate action, constraints, links, next test. |

The left and right panels are not decoration. They are working memory.

## Required Behavior

- The full workspace owns one viewport-height area.
- The shell itself has `overflow: hidden`.
- Each sidebar body scrolls independently through `Shell3Col`.
- The main panel scrolls or pans independently.
- Sidebars can collapse into gutters.
- Closed gutters show rich tooltips through `HoverPopover`.
- Sidebars can be resized and the width persists in `localStorage`.
- Mobile degrades to main surface + left/right drawers.
- Drawers are opened by peek buttons on the viewport edges.

## Sizing Defaults

Use these defaults unless the content proves otherwise:

```tsx
<Shell3Col
  flat
  minHeight="100%"
  leftOpenWidth={300}
  rightOpenWidth={340}
  minOpenWidth={220}
  maxOpenWidth={520}
/>
```

For graph-heavy fields, allow wider sidebars:

```tsx
leftOpenWidth={Math.max(200, Math.floor((vw - 32) * 0.22))}
rightOpenWidth={Math.max(200, Math.floor((vw - 32) * 0.22))}
```

## Storage Keys

Storage keys must identify the surface:

```text
labgraph_left
labgraph_right
labpotential_left
labpotential_right
insights_left
insights_right
```

Never use the default storage keys in a production surface. Generic keys cause
one workspace to inherit another workspace's widths.

## Intermediate Width Checks

Check at least:

| Width | Expected behavior |
| --- | --- |
| 375px | Main visible; side panels as drawers; no horizontal page scroll. |
| 768px | No broken card widths; text and badges wrap. |
| 1024px | Shell becomes 3-column; sidebars usable but not dominant. |
| 1366px | Main field is readable; sidebars can scroll independently. |
| 1920px | Main field expands without stretching text blocks into long lines. |

Known risk zone: tablet / small laptop widths. If content breaks here, reduce
side-panel copy, allow wrapping, or make one panel closed by default.

## Tooltip Grammar

Use the `closedTooltip` object on each sidebar:

```tsx
left={{
  body: leftPanel,
  closedTooltip: {
    title: 'Field',
    body: <>What this panel keeps in working memory.</>,
    related: [
      { label: 'Graph' },
      { label: 'Agent reports' },
    ],
  },
}}
```

Do not build local tooltip CSS. `Shell3Col` routes closed-panel tooltips through
`HoverPopover`, which already handles portal rendering, hover intent, smart
placement and overflow clipping.

## Cognitive Bridges

Every workspace should expose the next likely surfaces without forcing the user
to leave the current field.

Allowed bridge forms:

- `closedTooltip.related`
- detail-panel links
- selected-object actions
- THIA starters derived from `data-thia-*`
- tabs when the surfaces are siblings

Bridge rule:

```text
Bridge to orientation first, action second.
```

For example:

- Potential -> Graph: where does this density attach?
- Potential -> Bicone: what form does it assume?
- Potential -> Agent: which report produced it?
- Potential -> Theory crossing: what constraint does it test?

## Awareness Attributes

For THIA and future agents, the outer workspace should expose:

```tsx
data-thia-marker="..."
data-thia-active="true"
data-thia-tab="..."
data-thia-focus="..."
data-thia-item="..."
data-thia-relation="..."
data-thia-count="..."
```

These attributes are not copy. They are machine-readable orientation.

## Action Rules

For any action inside the workspace:

- Name the object, not the promise.
- Show whether the action mutates state.
- Keep review-only flows visibly review-only.
- Do not hide destructive or publishing side effects in a generic button.
- Prefer one high-probability action over many low-probability actions.

This inherits `docs/AZIONI_FACILI_UX_AI_KERNEL.md`.

## Anti-Patterns

- A top explanatory band that consumes the main field.
- A side panel that cannot scroll independently.
- A badge or long identifier that creates horizontal mobile overflow.
- A local tooltip implementation.
- Reusing another workspace's `localStorage` keys.
- Making the main field a card inside another card.
- Adding a third sidebar to solve bad information hierarchy.
- Hiding important information behind hover-only behavior on mobile.

## Promotion Rule

When a local workspace improves a behavior that should exist everywhere:

1. Generalize into `Shell3Col`, `HoverPopover` or `SplitPanel`.
2. Update the seed docs.
3. Update the template if the usage contract changed.
4. Verify one existing surface did not regress.


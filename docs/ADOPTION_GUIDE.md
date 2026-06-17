# Adoption Guide

Status: public and internal adoption contract.

Use this guide when a D-ND project or an external project wants to adopt these
seeds without importing accidental project-specific assumptions.

## Choose The Surface Type

Use `Shell3Col` when the user must keep three things visible:

```text
context -> active field -> consequences
```

Use a narrative page pattern when the user only needs to read forward.

Use `ResponseOutlineRail` when a long answer, report or assistant conversation
needs a visible map.

Use `ArticleDiagramRail` when a process, passage or reasoning chain needs to
stay visible near prose.

Use `TaxonomyMap` when concept status matters and candidates must not be
silently promoted into canonical terms.

Use `MegaMenuSeed` when a project needs a visible navigation contract across
tabs, page families, template families or subdomain surfaces.

Use `ThiaChatSeed` when the interface needs a THIA-style assistant that can see
the active surface, open panels and current focus before discussing changes.

## Minimum Integration Checklist

- Give each workspace unique `leftStorage`, `rightStorage` and split-panel
  storage keys.
- Keep all panel bodies independently scrollable.
- Let dense inner sections collapse into a book gutter before text starts
  breaking; this applies to both sides of an inner split.
- When an outer sidebar is closed, its book gutter must be clickable across the
  full sidebar height, not only on the icon or label.
- On mobile, convert inner left/right split panels into top/bottom panels with a
  horizontal resize bar, unless a drawer is explicitly safer for the workflow.
- Preserve stable dimensions for toolbars, counters, gutters and repeated
  rows.
- Avoid nested card containers around the main field.
- Use visible state labels for candidate, review-only, live, stale and error
  states.
- Expose action boundaries before mutating, publishing, deploying or deleting.
- Keep `data-agent-*` orientation attributes and preserve `data-thia-*` only
  when an internal D-ND / THIA surface still depends on them.
- If adding an assistant surface, preserve drag, resize, slow expansion, shrink
  and the `agent:context:ask` handoff behavior. Keep `dnd:thia:ask` as a
  compatibility event for internal surfaces.
- If adding megamenu navigation, keep active ids and group boundaries as data,
  not only visual labels.
- Verify at 375px, 768px, 1024px, 1366px and one wide desktop viewport.

## Awareness Attributes

The public default schema is:

```tsx
data-agent-marker="..."
data-agent-active="true"
data-agent-tab="..."
data-agent-focus="..."
data-agent-item="..."
data-agent-relation="..."
data-agent-count="..."
```

Optional:

```tsx
data-agent-subtab="..."
data-agent-mode="..."
data-agent-boundary="..."
data-agent-action="..."
```

These attributes are not visible copy. They are orientation for assistants,
automation, browser testing and future UX-AI agents.

## External Use

Internal D-ND / THIA surfaces can keep compatibility attributes:

```text
data-thia-marker
data-thia-focus
data-thia-action
```

Do not remove the concept. If agents or browser tools cannot tell where the
user is, the UI will be harder to inspect, test and coordinate.

## Copying Into A Product

1. Start from the demo to understand the behavior.
2. Copy the smallest component set required by the target surface.
3. Replace demo data with real domain data.
4. Keep the same side-effect boundaries.
5. Run browser checks before changing copy, routes or persistence.

See `docs/INTEGRATION_CHECKLIST.md` before copying components into another
domain.

## When Not To Adopt

Do not use this seed when:

- the page is a simple article;
- the surface needs only one context at a time;
- the main field would become a decorative card;
- the team has no plan to test mobile drawers;
- the only reason is visual consistency.

Consistency comes from behavior, hierarchy and state clarity. Matching colors
alone is not enough.

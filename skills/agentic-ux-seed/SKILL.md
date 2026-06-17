---
name: agentic-ux-seed
description: Reuse the public Agentic UX Seed layer from d-nd-ux-ai-seed for agentic workspaces, state-aware UI, response outlines, taxonomy inspectors, assistant context panels, design primitives, and portable human-AI interface adoption. Use when Codex or another coding assistant needs to select, copy, adapt, or review public agentic UX components while preserving orientation, state visibility, responsive recovery, and side-effect boundaries.
---

# Agentic UX Seed Skill

Use this skill when editing or adopting `d-nd-ux-ai-seed` components in another project.

The goal is to preserve behavior, not visual similarity. Every adoption must keep orientation, state visibility, responsive recovery and side-effect boundaries intact.

## Decision Tree

### Need a dense workspace?

Use `Shell3Col` / `AgentWorkspaceShell`.

Use when the user must keep context, active field and consequences visible together.

Carry with it:

- `HoverPopover`;
- unique `leftStorage` and `rightStorage` keys;
- closed side gutters;
- mobile drawers;
- orientation attributes.

### Need an inner two-panel surface?

Use `SplitPanel`.

Carry with it:

- unique `storageKey`;
- collapse thresholds;
- book gutters;
- keyboard resize behavior;
- mobile top/bottom behavior unless a drawer is safer.

### Need buttons, cards or modals?

Use `DesignPrimitives`:

- `AgentButton` / `DndButton`;
- `AgentCard` / `DndCard`;
- `AgentModal` / `DndModal`;
- `DND_RADII`.

Radius contract:

```text
hairline: 2px
control: 4px
panel: 6px
card: 8px
modal: 8px
pill: explicit only
```

Use modals only for bounded decisions, confirmations or focused editing. Use inspectors, drawers or split panels for ordinary inspection.

### Need local explanation?

Use `Tooltip` for function / mechanism / expectation.

Use `HoverPopover` for richer popovers, closed gutters or related-link cards.

Do not create local tooltip CSS unless the existing primitives cannot express the behavior.

### Need orientation inside a long answer or report?

Use `ResponseOutlineRail`.

Use only when the answer has enough sections, warnings, claims, actions or results to justify a rail.

### Need a process or reasoning diagram?

Use `ArticleDiagramRail`.

Use for sequence, relation, tension or process. Do not use it as decoration.

### Need a concept/candidate map?

Use `TaxonomyMap`.

Keep candidate, alias, ambiguous, scaffold and rejected states visible. Do not promote generated terms directly to canonical.

### Need a context-aware assistant?

Use `AgentContextChatSeed` for public/generic surfaces.

Use `ThiaChatSeed` with `brand="thia"` for internal THIA surfaces.

The assistant should read orientation before discussing changes.

When editing, copying or reviewing `ThiaChatSeed`, read
`docs/THIA_CHAT_PORT_PARITY_CONTRACT.md` first. Preserve the complete
Lab-derived behavior unit: side tab, Submit Module, header buttons, reset
confirmation, full-page restore, first-drag expansion, full-page drag-down
undock, manual resize, split divider and compact/mobile Chat/Form tabs.

## Orientation Contract

Public attributes:

```tsx
data-agent-marker="..."
data-agent-active="true"
data-agent-tab="..."
data-agent-focus="..."
data-agent-item="..."
data-agent-relation="..."
data-agent-count="..."
data-agent-boundary="..."
```

Compatibility attributes:

```tsx
data-thia-marker="..."
data-thia-active="true"
data-thia-tab="..."
data-thia-focus="..."
data-thia-item="..."
data-thia-relation="..."
data-thia-count="..."
data-thia-boundary="..."
```

Prefer `data-agent-*` in public code. Keep `data-thia-*` when an internal surface still depends on it.

## Handoff Events

Public event:

```ts
agent:context:ask
```

Compatibility event:

```ts
dnd:thia:ask
```

Prefer the public event in new demos and external code. Keep the compatibility event for internal surfaces.

## Before Editing

Answer these before changing code:

```text
Which surface type is this?
Which seed is the smallest complete unit?
Which linked primitives must travel with it?
Which storage keys must be renamed?
Which orientation attributes must remain stable?
Which responsive states must be verified?
Which side effects are impossible, review-only or real?
```

## Verification

Check at least:

```text
375px
768px
1024px
1366px
one wide desktop viewport
```

Verify:

- closed gutters reopen;
- resize handles still work;
- mobile drawers or stacked panels do not trap scroll;
- modal closes through button, Escape and backdrop;
- focus remains visible;
- text does not overflow cards, buttons, chips or drawers;
- localStorage/sessionStorage keys are unique;
- orientation attributes are present on the active surface;
- if using `ThiaChatSeed`, reset, full page, drag, resize, Submit Module and
  compact/mobile tab behavior match `docs/THIA_CHAT_PORT_PARITY_CONTRACT.md`.

## Do Not Do

- Do not copy a visual component without its behavior contract.
- Do not use modals for ordinary inspection.
- Do not remove orientation attributes.
- Do not create local tooltip systems before checking `Tooltip` and `HoverPopover`.
- Do not promote domain-heavy pages as reusable seeds.

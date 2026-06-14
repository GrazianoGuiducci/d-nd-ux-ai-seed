# THIA Chat Seed

Status: reusable assistant surface.

`ThiaChatSeed` extracts the portable UI behavior from the D-ND public THIA
chat without coupling this repo to the live backend.

The goal is not to ship a fake assistant. The goal is to preserve the behavior
contract that makes THIA useful across domains: it can see the active surface,
the focused item and the open UI context before discussing changes with the
user.

## Behavior Contract

- Reads `data-thia-*` attributes from the active surface.
- Accepts explicit `focus` props from the host app.
- Stores open/messages in session storage.
- Stores drag/resize geometry in local storage.
- Supports `dnd:thia:ask` handoff events.
- Expands slowly when dragged from the compact home position.
- Shrinks back when dragged downward from a readable large frame.
- Resizes from the lower-right corner on desktop.
- Uses a true full-screen mobile panel.
- Keeps internal scrollbars visually hidden.

## Handoff Event

Any surface can ask THIA to open with context:

```ts
window.dispatchEvent(new CustomEvent('dnd:thia:ask', {
  detail: {
    source: 'seed-menu',
    focus: 'Adoption guide',
    relation: 'Integration',
    prompt: 'Explain what must travel together.',
  },
}));
```

## Awareness Attributes

Recommended host attributes:

```tsx
data-thia-marker="ux-ai-seed-demo"
data-thia-active="true"
data-thia-tab="patterns"
data-thia-focus="Three-column workspace"
data-thia-item="workspace"
data-thia-relation="layout"
data-thia-boundary="layout and orientation only"
```

External projects can rename the schema, but they should not remove the
concept. Assistant surfaces need stable orientation data.

## Mobile

On mobile THIA uses the full viewport:

```text
left: 0
top: 0
width: 100vw
height: 100dvh
```

This avoids half-panels, covered bodies and nested scroll traps. The message
area remains scrollable when needed, but the scrollbar is hidden.


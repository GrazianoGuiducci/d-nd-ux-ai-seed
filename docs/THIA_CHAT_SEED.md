# Agent Context Chat Seed

Status: reusable assistant surface.

Public export: `AgentContextChatSeed`.

Compatibility export: `ThiaChatSeed`.

The seed extracts portable assistant UI behavior from the D-ND public THIA chat
without coupling this repo to a live backend.

The goal is not to ship a fake assistant. The goal is to preserve the behavior
contract that makes an assistant useful across domains: it can see the active
surface, the focused item and the open UI context before discussing changes with
the user.

## Public / Internal Branding

Use the generic public mode by default:

```tsx
<AgentContextChatSeed />
```

Use internal THIA styling explicitly:

```tsx
<ThiaChatSeed brand="thia" title="THIA" subtitle="Design assistant" />
```

The behavior should remain the same. Branding should not carry the whole agentic
orientation contract.

## Behavior Contract

- Reads `data-agent-*` attributes from the active surface first.
- Falls back to `data-thia-*` attributes for internal compatibility.
- Accepts explicit `focus` props from the host app.
- Stores open/messages in session storage.
- Stores drag/resize geometry in local storage.
- Supports public `agent:context:ask` handoff events.
- Supports compatibility `dnd:thia:ask` handoff events.
- Expands from compact to readable when the header is first dragged.
- Expands to a large field through the header button or manual resize.
- Shrinks from large to medium when dragged downward, without docking back to
  the home corner.
- Resizes from the lower-right corner on desktop.
- Includes an optional in-chat feedback form for "help us improve" flows.
- Uses a true full-screen mobile panel.
- Keeps internal scrollbars visually hidden.

## Feedback Form

The feedback form is rendered inside the chat, so a host app can expose a
"Help us improve" or "Aiutaci a migliorare" action without rebuilding the
assistant surface.

```tsx
<AgentContextChatSeed
  feedback={{
    label: 'Aiutaci a migliorare',
    title: 'Aiutaci a migliorare',
    categories: ['Design', 'Contenuto', 'Comportamento', 'Contributo'],
  }}
  onFeedbackSubmit={async (payload) => {
    await saveFeedback(payload);
    return 'Feedback registrato per revisione.';
  }}
/>
```

If `onFeedbackSubmit` is omitted, the component only captures the note locally
and appends a review-ready confirmation message. It does not send network
requests by itself.

Set `feedback={false}` when a host surface already owns a separate contribution
flow.

## Drag / Expansion Contract

Desktop behavior should stay limited to these transitions:

- compact bubble opens the chat;
- dragging the compact/readable header expands to a readable frame;
- the expand button opens a large field;
- manual resize can also create a large frame;
- dragging a large frame downward shrinks it to a medium frame near its current
  position;
- ordinary movement only repositions the current frame.

Avoid adding additional auto-dock or auto-resize behavior. More implicit motion
makes the assistant harder to trust in dense workspaces.

## Handoff Event

Any surface can ask the assistant to open with context:

```ts
window.dispatchEvent(new CustomEvent('agent:context:ask', {
  detail: {
    source: 'seed-menu',
    focus: 'Adoption guide',
    relation: 'Integration',
    prompt: 'Explain what must travel together.',
  },
}));
```

Compatibility:

```ts
window.dispatchEvent(new CustomEvent('dnd:thia:ask', { detail }));
```

## Awareness Attributes

Recommended public host attributes:

```tsx
data-agent-marker="ux-ai-seed-demo"
data-agent-active="true"
data-agent-tab="patterns"
data-agent-focus="Three-column workspace"
data-agent-item="workspace"
data-agent-relation="layout"
data-agent-boundary="layout and orientation only"
```

Compatibility host attributes:

```tsx
data-thia-marker="ux-ai-seed-demo"
data-thia-active="true"
data-thia-tab="patterns"
data-thia-focus="Three-column workspace"
data-thia-item="workspace"
data-thia-relation="layout"
data-thia-boundary="layout and orientation only"
```

External projects can rename the schema, but they should not remove the concept.
Assistant surfaces need stable orientation data.

## Mobile

On mobile the assistant uses the full viewport:

```text
left: 0
top: 0
width: 100vw
height: 100dvh
```

This avoids half-panels, covered bodies and nested scroll traps. The message
area remains scrollable when needed, but the scrollbar is hidden.

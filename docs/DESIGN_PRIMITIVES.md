# Design Primitives

Status: promoted baseline for portable UI elements.

These primitives translate repeated D-ND interface styling into a small,
copyable contract for controls, cards and focused overlays. They are intentionally
quiet: dense tools need stable controls, not decorative surfaces.

## Source

Use:

- `src/DesignPrimitives.tsx`
- `src/Tooltip.tsx`
- `src/ui/HoverPopover.tsx`

Public exports:

- `AgentButton`
- `AgentCard`
- `AgentModal`

Compatibility exports:

- `DndButton`
- `DndCard`
- `DndModal`

`Tooltip` and `HoverPopover` already cover explanatory hover/focus depth. Do not
create local tooltip CSS when one of those primitives can express the behavior.

## Radius Contract

```text
hairline: 2px
control: 4px
panel: 6px
card: 8px
modal: 8px
pill: explicit only
```

Cards and modals stop at 8px. Controls stay tighter. Pills are reserved for
status chips, compact tags and segmented option chips, not general containers.

## Buttons

Use `AgentButton` for public/generic code and `DndButton` for internal
compatibility.

Variants:

- `primary`: clear next action;
- `secondary`: ordinary command;
- `ghost`: quiet utility or close action;
- `danger`: destructive or risky action.

Buttons must have stable height, visible focus state and short labels. Icon-only
buttons need an `aria-label`.

## Cards

Use `AgentCard` / `DndCard` for individual repeated items, inspector facts and
compact status/result blocks.

Do not wrap an entire page section in a card. Do not put cards inside other
cards unless the inner item is a real repeated record.

Tones:

- `default`: neutral information;
- `active`: selected or current item;
- `warning`: needs attention but not destructive;
- `danger`: destructive, failed or blocked state.

Interactive cards are focusable. If they receive a click handler, Enter and Space
should activate them through the same path. For primary actions, prefer a real
button or link when the whole card does not need to be clickable.

## Modals

Use `AgentModal` / `DndModal` for bounded decisions, confirmations or focused
editing.

Do not use a modal for ordinary inspection when a sidebar, drawer or split panel
keeps context visible. A modal should close through:

- explicit close button;
- Escape;
- backdrop pointer interaction.

The modal locks body scroll only while open. Focus enters the modal on open, Tab
and Shift+Tab remain trapped inside it, and focus returns to the previous element
when the modal closes.

## Tooltips

Use `Tooltip` when the text explains:

- function;
- mechanism;
- expectation.

Use `HoverPopover` directly when the popover is richer than a tooltip, such as a
closed-panel gutter explanation or compact related-links card.

Tooltip copy should be short. Long reasoning belongs in an inspector, sheet,
drawer or document body.

## Copy Order

When moving these primitives into a target project, copy:

1. `src/DesignPrimitives.tsx` for buttons, cards, modals and radius tokens.
2. `src/Tooltip.tsx` plus `src/ui/HoverPopover.tsx` for tooltip behavior.
3. Any target-specific CSS variables used by the consuming app, or map the
   fallback variables intentionally.

Then verify desktop, tablet and mobile for overflow, focus, backdrop, scroll
lock, focus restore and long labels.

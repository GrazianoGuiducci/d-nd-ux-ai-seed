# QA Manual Checklist

Status: required manual verification checklist for promoted seeds.

Use this checklist before promoting a candidate pattern, publishing a package build or copying a seed into another project.

## Viewports

Check at minimum:

```text
375px
768px
1024px
1366px
wide desktop, at least 1600px
```

Record any breakpoint where behavior changes.

## Workspace Shell

- Left and right sidebars open and close.
- Closed side gutters reopen from the full gutter height.
- Resizers work with pointer input.
- Keyboard resize works where separators are focusable.
- Side panels scroll independently.
- Main field does not become a nested card inside another card.
- Mobile uses drawers and does not create horizontal page scroll.
- Backdrop closes mobile drawer.
- Peek controls do not block primary controls.

## Split Panel

- Horizontal split resizes on desktop.
- Mobile horizontal split becomes top/bottom when `mobileBehavior="resizable"`.
- Drawer mode only appears when explicitly requested.
- First and second collapse thresholds work.
- Book gutters reopen collapsed panes.
- Resizer remains separate from the book gutter.
- Text and badges do not overflow at narrow widths.

## Design Primitives

### Buttons

- Primary, secondary, ghost and danger variants are distinguishable.
- Focus ring is visible.
- Disabled state is visible and not clickable.
- Long labels do not break layout.
- Icon-only buttons have `aria-label`.

### Cards

- Card radius follows the 8px contract.
- Interactive cards are keyboard reachable.
- Enter and Space activate interactive cards when they have a click handler.
- Cards are not nested unless the inner card is a real repeated record.

### Modals

- Modal radius follows the 8px contract.
- Modal opens with focus inside it.
- Tab and Shift+Tab stay inside the modal.
- Close button closes the modal.
- Escape closes the modal.
- Backdrop pointer interaction closes the modal.
- Focus returns to the previous element after close.
- Body scroll locks only while modal is open.
- Modal is not used for ordinary inspection that should remain in a sidebar, drawer or split panel.

## Tooltip / HoverPopover

- Popovers render through portal and are not clipped by parent overflow.
- Escape dismisses popover when supported.
- Hover intent allows moving from anchor to popover without immediate loss.
- Links inside popovers remain clickable.
- Tooltip copy stays short.
- Visible tooltip triggers are present where a demo block needs explanation.
- Mobile does not depend on hover-only content for important information.

## Response Outline

- Rail is hidden or avoided for short content.
- Active item can follow scroll or selected block when host app provides state.
- Labels are short and do not duplicate full answer text.
- Warnings mark real risks, not decorative emphasis.
- Mobile uses drawer, sticky strip or inline mode.

## Article Diagram

- Diagram explains sequence, relation, tension or process.
- It is not decorative.
- No more than seven visible nodes before grouping.
- Labels remain readable without hover.
- Horizontal diagrams do not force full-page horizontal scroll.

## Taxonomy Map

- Canonical, candidate, alias, ambiguous, scaffold and rejected statuses are visible.
- Generated terms enter as candidates, not canonical nodes.
- Relation labels come from data.
- Selection callback works if provided.
- Long labels do not overflow.

## Mega Menu

- Trigger opens and closes.
- Escape closes menu.
- Outside pointer interaction closes menu.
- Active item is visible.
- Group boundaries and item descriptions remain data-driven.
- Mobile trigger stays compact and does not consume the full header row.

## Agent Context Chat

- Bubble opens the assistant.
- Header drag works on desktop.
- Header click without movement does not resize the assistant.
- Header drag only repositions the assistant; vertical movement does not expand
  or shrink it.
- Expand and close buttons do not start accidental drag.
- Expand button opens a full-page frame and next click restores the prior frame.
- Resize handle works on desktop.
- Mobile opens as full-screen panel.
- Messages scroll without visible nested scrollbar traps.
- Feedback button opens the split chat / Submit Module frame.
- Fixed "Help us improve" side tab opens the chat with the Submit Module visible.
- Submit Module shows Contribution/Question tabs, attach file, clear form,
  preview/edit, download, name/email, newsletter and submit controls.
- Submit Module divider resizes chat/form columns on desktop.
- Feedback submit uses the host handler when provided and otherwise shows a
  local review-ready confirmation.
- `agent:context:ask` opens assistant with context.
- `dnd:thia:ask` still works for compatibility.
- `data-agent-*` is read before `data-thia-*`.

## Orientation Attributes

At least one active surface exposes:

```tsx
data-agent-active="true"
data-agent-marker="..."
data-agent-focus="..."
```

Compatibility may also expose:

```tsx
data-thia-active="true"
data-thia-marker="..."
data-thia-focus="..."
```

Do not scrape visible copy when stable attributes are available.

## Storage

- `localStorage` keys are unique per surface.
- `sessionStorage` chat keys are unique per assistant surface.
- One workspace does not inherit another workspace width.
- Reset behavior is understandable when storage is cleared.

## Side Effects

For every action, classify it as:

```text
impossible
read-only
review-only
mutating
publishing
destructive
```

Mutating, publishing and destructive actions need visible boundaries before execution.

## Acceptance Note

A seed is ready only when the behavior works across viewport, keyboard, pointer and assistant-orientation checks. Visual consistency alone is not enough.

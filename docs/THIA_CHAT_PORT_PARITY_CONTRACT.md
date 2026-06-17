# THIA Chat Port Parity Contract

Status: required contract for porting Lab-derived THIA chat behavior.

This document exists because visual similarity is not enough. The chat is a
stateful workspace tool: Codex must copy the interaction contract, responsive
states and host handoff boundaries together.

## Source Pointers

Primary behavior references:

```text
/opt/lab-d-nd-site/assets/js/domus-widget.js
/opt/d-nd_com_repo/components/Chatbot.tsx
```

Seed implementation:

```text
src/ThiaChatSeed.tsx
docs/THIA_CHAT_SEED.md
docs/QA_MANUAL_CHECKLIST.md
```

Before changing or porting this surface, read the source blocks for:

- header buttons and reset confirmation;
- default chat, intake and full-page frame helpers;
- drag, resize and split handlers;
- Submit Module markup;
- compact/mobile intake tabs;
- storage keys and host submit callbacks.

## Complete Unit

`ThiaChatSeed` must travel as one unit when a host needs the Lab-derived chat:

- bubble/avatar closed state;
- floating window frame;
- header controls: Manager, Reset, Full page, Close;
- context-aware chat body;
- lower-right desktop resize grip;
- Help us improve side tab;
- split Submit Module with chat pane and form pane;
- mobile/compact Submit Module tabs;
- storage and handoff events.

Do not copy only the card shell, only the form or only the bubble. That creates
the broken middle state where the UI looks present but the user cannot rely on
its dynamics.

## Header Contract

Desktop header controls, left to right after title:

```text
Manager -> Reset chat -> Full page / Restore -> Close
```

Rules:

- Header drag starts only from the header area, not from buttons.
- Manager is a host hook. In a reusable seed it may be inert unless the host
  provides `onManagerClick`, but the button position remains reserved.
- Reset uses a confirmation state before clearing messages.
- Reset clears the chat conversation and input, not the whole frame geometry.
- Full page stores the previous frame and restores it on the next click.
- Close hides the chat and returns to the bubble/avatar state.

## Frame States

The frame has three main desktop states:

```text
compact chat home
readable floating frame
full-page working frame
```

Submit Module uses its own default frame:

```text
wide centered intake frame
```

Required transitions:

- Avatar open always returns to compact chat home.
- Help us improve opens the Submit Module directly in the wide intake frame.
- First header drag from compact chat home expands to a readable frame and then
  continues as a drag.
- Header drag after that only repositions the current frame.
- Full-page button opens a viewport-sized frame with small margins.
- Dragging a full-page frame downward undocks it to an intermediate readable
  frame for chat, or the wide intake frame for Submit Module, and continues the
  drag. It must not collapse to the compact/minimum chat home.
- Dragging a large chat frame downward shrinks it to compact/readable default
  only once per gesture.
- Manual resize uses the same frame clamp and compact thresholds. It must not
  trigger extra auto-expand or auto-shrink loops.

## Submit Module Contract

The module opens inside the chat window, not as a separate page:

- chat pane on the left;
- form pane on the right;
- draggable divider on desktop;
- Contribution / Question mode buttons;
- large trace textarea;
- markdown preview/edit toggle;
- attach-file affordance for host handoff;
- clear form, preview, download and submit controls;
- optional name and email;
- newsletter checkbox;
- status area that reports validation, reset confirmation or submit result.

The seed does not send network requests by itself. `onFeedbackSubmit` is the
host boundary.

## Compact And Mobile Contract

Compact intake is active when:

```text
mobile viewport, or intake frame width < compact threshold
```

In compact intake:

- show Chat / Form tabs;
- show one pane at a time;
- open Submit Module on the Form tab;
- keep the chat composer usable on the Chat tab;
- hide the desktop split divider;
- hide the lower-right resize grip on mobile;
- use a full-viewport panel on phone widths.

Do not stack chat and form vertically on mobile unless the host deliberately
forks the behavior and documents why. The Lab contract uses tabs to avoid
nested scroll traps.

## Storage Contract

Session storage:

- open/closed state;
- recent messages.

Local storage:

- frame geometry;
- Submit Module split percentage.

Every host must use unique storage keys. A copied chat must not inherit another
workspace position, size, messages or split ratio.

## Verification

Minimum non-Playwright checks for this repo:

```text
npm run typecheck
npm run build
npm run pack:dry
git diff --check
```

Manual browser checks after publish:

- bubble opens compact home;
- side tab opens Submit Module;
- Manager, Reset, Full page and Close are present;
- Reset needs a second click and clears conversation;
- first compact drag expands once;
- ordinary drag repositions only;
- full-page drag downward undocks;
- resize grip changes size without surprise transitions;
- Submit Module split divider respects form minimum width;
- mobile or narrow frame shows Chat/Form tabs and one pane at a time.

## Promotion Rule

A chat port is incomplete if any of these are missing:

- reset confirmation;
- full-page restore;
- first-drag readable expansion;
- full-page downward undock;
- Submit Module side tab;
- compact/mobile tabs;
- host submit boundary;
- unique storage keys;
- manual QA against the behaviors above.

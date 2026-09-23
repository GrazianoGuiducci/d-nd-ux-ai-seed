# Cognitive Motion And Focus Continuity

Use this reference when a transition changes the active surface, reading plane,
focus owner, panel topology or working scale. Motion is part of orientation: it
must show where the active object comes from, where it goes and what remains in
control.

## Motion Classes

```text
control feedback:
  240-360 ms; hover, focus, selection and reversible local confirmation.

state transition:
  420-620 ms; disclosure, progress, selected-state refinement and compact
  changes that do not move the main focus.

focus transition:
  560-780 ms; next/back step, summary open/close, inspector ownership change
  and movement to a new primary question.

surface transition:
  760-1250 ms; chat/avatar flight, modal expansion, full-page restore, docking
  and large frame reconfiguration.
```

Use a continuous easing curve such as `cubic-bezier(.2,.78,.18,1)` for surface
transitions and compact state changes. For a longer viewport scroll whose job
is orientation, prefer a constant-rate interpolation: a pronounced slow start
or acceleration makes the focus destination harder to anticipate. Do not slow
direct pointer manipulation: drag, resize, pan and split movement must remain
one-to-one with the pointer. Animate only the release, dock, restore or final
settle.

## Direction Contract

```text
open:
  origin control or object -> active surface.

close:
  active surface -> the same avatar, trigger, node or owner control.

forward step:
  enter from the reading direction of progress.

back step:
  enter from the reverse direction.

disclosure open:
  expand from the owning summary, label or selected object.

disclosure close:
  return focus and viewport orientation to that owner.
```

Never remove or hide a closing surface before its meaningful transition has
finished. Remove it from pointer and keyboard interaction while it closes, then
restore focus to the origin. If the origin is unavailable, use the nearest
stable owner rather than leaving focus on `body`.

## Complex Surface Patterns

For a book-closing sidebar, hinge the motion on the boundary it belongs to,
fold the content and frame as one surface, then update the main field after the
relationship is legible. Preserve `aria-expanded`, remove the closed panel from
pointer/keyboard/accessibility navigation, and return focus to the opener.

For a field and inspector that share width, do not assume that a
`grid-template-columns` transition is continuous. Initial and final tracks must
use compatible interpolable types; `0fr` to a clamped length can remain static
and then jump even when a duration is declared. Let the structural shell and
boundary participate from the first geometry frame. Settle the owning surface
and selected raccord as a readable pair, then reveal inspector orientation and
detail slightly later so the last semantic plane matches the final focus owner.
Close the same geometry in reverse while the inspector is inert. Verify frame
deltas and semantic reveal order in both directions, not only the final
screenshot.

When selection changes inside an inspector that is already open, keep the
inspector shell, boundary, gutter and scroll plane stable. Animate only the
information that changed. A new selection must cancel and replace any in-flight
content animation before it starts; overlapping Web Animations can otherwise
produce opacity flashes, stale focus and a final detail that does not match the
last selected item. Test a burst of rapid selections and sample intermediate
frames: shell opacity and bounds must remain stable, content must never
disappear, and the settled heading must belong to the final selection.

For draggable or resizable modals and assistants, keep movement immediate
during manipulation, clamp geometry to the viewport, preserve the active
object's free space and animate only the final settle. A large frame may undock
to a readable intermediate size; it must not jump to an unrelated compact
state.

For labels, chips or side tabs that open a module inside a chat, reveal in this
order:

```text
assistant frame -> module region -> module controls -> input focus
```

Keep the conversation visible when it explains the module. On compact/mobile
surfaces, use explicit Chat/Module tabs or another single-pane equivalent to
avoid nested scroll traps.

## Interaction Economy

Selecting an answer does not authorize leaving the current step. Preserve an
explicit confirmation by default, even for a reversible single choice. Remove
it only after an explicit operator decision or repeated user evidence proves
that it adds no useful reading or comparison time. Never auto-advance
multiple-choice, ambiguous, destructive, submitting or externally effective
actions.

When a new question, follow-on group or expanded disclosure becomes the next
useful object, move both viewport and focus to it with a slower focus-class
scroll. This includes controls revealed below the current viewport. Do not
animate the native option list of an operating-system select; animate the
surrounding reading plane and preserve keyboard behavior.

Do not use lateral motion when the old and new planes have no meaningful
left/right spatial relation. In a linear form, a fade plus explicit focus and
viewport transfer can communicate the change more truthfully than opposing
slide animations.

## Accessibility And Validation

- Respect `prefers-reduced-motion`; preserve state change, focus transfer and
  direction through non-motion cues.
- Motion must not be the only state encoding.
- Avoid simulated urgency, perpetual attention loops and decorative movement.
- Verify opening and closing from their real origin, not only from a default
  viewport position.
- Verify keyboard focus after open, close, next, back, dock and restore.
- Verify mobile and tablet behavior, not only desktop animation.
- Verify a closing surface cannot still receive clicks or keystrokes.
- Verify the animation duration and unmount/`display:none` delay describe the
  same transition; a long CSS transition paired with an early hide is a broken
  contract.

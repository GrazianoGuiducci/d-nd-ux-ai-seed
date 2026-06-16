# Integration Checklist

Status: practical guide for coders and agents.

Use this list before copying a single component into another project. Most
breakage happens when a coder takes the visible component but leaves behind the
resize, storage, awareness or mobile contract.

## Carry These Together

### Workspace Shell

- `Shell3Col`
- `HoverPopover`
- unique `leftStorage` and `rightStorage` keys
- full-height closed side gutters
- mobile drawer behavior
- `data-thia-*` or equivalent awareness attributes

Use it when context, active field and consequence must stay visible together.

### Inner Split Surfaces

- `SplitPanel`
- unique `storageKey`
- first and second collapse thresholds
- closed book gutters
- separate resizer handle
- mobile top/bottom resize behavior

Do not remove the closed book gutters. They are the recovery path when a panel
becomes too small.

### Navigation And Tabs

- `MegaMenuSeed`
- route or tab data
- active item id
- group descriptions
- handoff event to the assistant when a menu item needs explanation

Use the megamenu for pages, tabs, template families and subdomain navigation.
Keep it as a navigation contract, not only a decorative dropdown.

On mobile, keep the trigger as a compact hamburger. Do not let a text button
consume the whole top row.

### Design Primitives

- `DndButton`
- `DndCard`
- `DndModal`
- `DND_RADII`
- `Tooltip`
- `HoverPopover`

Use these for shared control, card, modal and tooltip styling before creating
local variants. Cards and modals should not exceed 8px radius. Controls use
4px radius unless they are explicit pills.

Use modals only for bounded decisions or focused editing. Use sidebars, drawers
or split panels for ordinary inspection so context remains visible.

### Assistant Surface

- `ThiaChatSeed`
- `data-thia-*` attributes on the active surface
- session storage for open/messages
- local storage for frame geometry
- `dnd:thia:ask` event support
- drag, slow expansion, shrink and resize behavior

The assistant must know what is open and which surface is in focus. A chat box
without the awareness contract is not a faithful port of THIA.

On mobile, open THIA as a full-screen surface and hide internal scrollbars.

### Long Content Orientation

- `ResponseOutlineRail` for reports and long assistant conversations
- `ArticleDiagramRail` for articles, diagrams and process passages
- explicit focal points or section ids

Do not place the point rail in generic workspace headers. Use it for article
length, generated diagrams and long chat checkpoints.

### Concept Systems

- `TaxonomyMap`
- stable node ids
- canonical/candidate/ambiguous status
- edge labels
- selection callback

Use it where the user must see uncertainty before a concept becomes canonical.

## Minimum Copy Order

1. Copy the smallest working template.
2. Copy the components it imports.
3. Copy the related CSS or injected-style contract.
4. Rename storage keys for the target app.
5. Replace demo data with domain data.
6. Preserve awareness attributes.
7. Test desktop, tablet and mobile.
8. Only then adapt visuals.

## Verification Targets

- Sidebars open by click and drag.
- Closed external gutters are clickable across full height.
- Closed internal books are clickable and have a separate drag handle.
- Mobile inner split changes from left/right to top/bottom.
- Mobile does not need visible scrollbars for dense panel surfaces.
- Text does not overflow route boxes, cards, buttons or drawers.
- Cards, modals and controls use the radius contract from
  `docs/DESIGN_PRIMITIVES.md`.
- Modals close through Escape, close button and backdrop click.
- The assistant reads the current focused surface.
- The powered link and assistant widget do not block primary controls.

## Agent Instruction

When using this repo as a skill or project reference, ask the agent to answer
these before editing:

```text
Which surface type is this?
Which seed is the smallest complete unit?
Which linked primitives must travel with it?
Which storage keys must be renamed?
Which awareness attributes must remain stable?
Which responsive states must be verified?
```

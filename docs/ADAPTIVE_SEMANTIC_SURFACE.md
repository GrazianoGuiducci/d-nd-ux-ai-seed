# Adaptive Semantic Surface

Status: candidate design and behavior contract for public AI-system surfaces.

Source evidence: MAIOS public pages, MMK documentation and the MAIOS Living Grid visual study. The source project changes rapidly; this document therefore extracts stable behavior and composition rules rather than current copy, claims or page structure.

## One-Sentence Contract

This pattern helps a user understand, explore and control a changing AI system while preserving orientation, continuity and action boundaries.

It does not execute agentic work by itself. It becomes misleading when color, motion or diagrams imply activity, intelligence or continuity that the product cannot verify.

## Use When

Use an Adaptive Semantic Surface when:

- one entry point spans several projects, tools, domains or semantic planes;
- the primary experience must stay simple while secondary controls remain available;
- content, system state and operational depth change more often than the public shell;
- diagrams are needed to explain flows, boundaries or state transitions;
- a surface must work in paper-light, ink-dark and mixed modes without becoming three unrelated themes;
- a coding agent needs stable visual and interaction rules while preserving the target project's current truth.

Do not use it when:

- a linear article or single-purpose form is sufficient;
- the design would add orchestration language to a product with no orchestration capability;
- a static poster is being mistaken for an interface contract;
- motion would be decorative, continuous or distracting;
- secondary controls are hidden without a visible recovery path.

## Design Manifesto

### 1. Context before interface

The interface first establishes where the user is, what is active and what can change. Components follow the context; they do not define it.

### 2. Continuity over fragmentation

A transition should preserve the previous state, source and next possible action. A new panel, route or semantic plane must feel like an expansion of the same work, not a reset.

### 3. Space is part of the model

Negative space is not leftover area. It expresses priority, distance, relation, uncertainty and possibility. The system does not fill space to prove what it knows.

### 4. Structure guides; color activates

Grid and alignment provide orientation. Color marks semantic conditions: reading, system depth, intent, attention and verified activity. Color never substitutes for labels, icons or state text.

### 5. Ergonomics is a living system

Density, disclosure and emphasis may adapt to intent, viewport, task and user preference. Meaning, action order and safety boundaries must remain stable.

### 6. The interface learns without becoming unpredictable

Adaptation may change emphasis, spacing, disclosure and suggested next actions. It may not silently rename controls, move destructive actions, alter keyboard order or remove required verification.

### 7. One entry, many semantic planes

The primary surface exposes one coherent point of entry. Projects, tools, knowledge, data, people and models appear as related planes, not as disconnected applications.

### 8. Diagrams must carry truth

Every node, line and animation explains a real process, relation, state or boundary. Decorative networks and fictitious activity indicators are prohibited.

### 9. Control remains recoverable

Progressive disclosure is valid only when the user can discover, open, inspect, close and restore the hidden layer with keyboard and pointer input.

### 10. The user keeps direction

The system may orient, recommend and adapt. The user retains authority over goals, irreversible actions, visibility preferences and the level of automation.

## Core Composition Model

### Stable Anchors

Every viewport should expose no more than three stable anchors:

1. current intent or task;
2. active context or semantic plane;
3. next safe action or verification state.

Navigation, project state and secondary controls may appear around these anchors, but must not compete with all three at once.

### Living Grid

Use a grid as an alignment field, not as a cage.

Required behavior:

- preserve shared baselines and vertical axes across sections;
- draw only the lines that communicate structure or state;
- allow selected fields, illustrations and diagrams to cross a grid boundary;
- leave at least one large unboxed area in every primary viewport;
- use cards only for discrete records, controls or repeated objects;
- do not wrap an entire section in a card when spacing and alignment are sufficient.

Recommended layout:

- desktop: 12 columns;
- tablet: 6 columns;
- mobile: 4 columns;
- base spacing unit: 8px;
- major rhythm: 24, 40, 64, 96 and 128px;
- maximum readable body measure: 68 characters;
- display copy may be narrower to create poster-like tension.

### Semantic Negative Space

Spacing may encode relation only when another cue confirms the meaning.

- proximity: active relation or shared task;
- separation: weak, deferred or optional relation;
- expansion: focus mode and reduced cognitive load;
- compression: control mode and comparison;
- interruption: boundary or change of semantic plane;
- open margin: unresolved or intentionally available possibility;
- overlap: convergence, dependency or controlled conflict.

Do not rely on distance alone for essential meaning. Reinforce it with labels, alignment, color, line, iconography or state text.

### Semantic Thread

A single line may move through the surface and change role while preserving continuity.

The thread may:

- underline an active phrase;
- connect a source to a result;
- become a section boundary;
- enter a diagram as a flow;
- terminate at a status or action;
- continue beyond the viewport to imply resumable work.

The thread must not connect unrelated content. On reduced motion, it remains static and fully legible.

### Chromatic Fields

Use large color fields as semantic environments, not decoration.

| Role | Default token | Preferred text | Meaning |
| --- | --- | --- | --- |
| Paper | `#F5EFE3` | `#111827` | reading, orientation, decision support |
| Ink | `#0A0F13` | `#F5EFE3` | depth, inspection, system internals |
| System blue | `#0A3D91` | `#FFFFFF` | coordination, continuity, operational depth |
| Intent red | `#C52F24` | `#FFFFFF` | decision, declaration, bounded action |
| Attention yellow | `#F2C94C` | `#111827` | temporary focus, option, selected possibility |
| Adaptive green | `#0F7A31` | `#FFFFFF` | verified active state, learning, continuity signal |

Contrast guidance for normal text:

- white on system blue: approximately 10.1:1;
- white on intent red: approximately 5.5:1;
- dark ink on attention yellow: approximately 11.2:1;
- white on adaptive green: approximately 5.5:1;
- dark ink on paper: approximately 15.5:1.

Do not use white text on attention yellow. Do not use red and yellow together as the default action pair; reserve that combination for a specific warning or editorial moment.

## Theme Contract

The three modes are semantic arrangements, not automatic color inversions.

### Paper Mode

Use for reading, orientation, planning and public narrative.

- paper background;
- ink text;
- blue and red as structural accents;
- green only for verified active state;
- visible print texture may be subtle and must not reduce legibility.

### Ink Mode

Use for inspection, orchestration, system state and concentrated work.

- ink background;
- paper text;
- system blue as a field or depth cue;
- red for bounded decisions;
- green for active/verified state;
- avoid generic charcoal cards on a black page; surfaces must remain distinguishable by border, spacing or elevation.

### Hybrid Mode

Use when the user must understand and control at the same time.

- paper for intent, prose and decisions;
- blue or ink for coordination and system depth;
- red for a current decision or action boundary;
- transitions between fields must preserve the semantic thread and focus order;
- never alternate large fields only for visual rhythm.

A user-selected theme preference must persist. Adaptive mode may suggest or locally shift a field, but may not override an explicit user preference without consent.

## Perceptual Navigation

Navigation should answer four questions without opening a menu:

1. Where am I?
2. What is active?
3. What is related?
4. What can I safely do next?

Use:

- persistent route or plane label;
- one dominant active marker;
- short relation labels;
- edge rails or drawers for secondary systems;
- a visible recovery control when a rail is collapsed;
- focus-preserving transitions.

Avoid:

- hidden navigation that depends only on hover;
- multiple equally bright active colors;
- decorative breadcrumbs with no route behavior;
- animated maps that cannot be navigated by keyboard;
- scroll-jacking or mandatory horizontal scrolling on mobile.

## Progressive Disclosure

Secondary specifications, logs, controls and management views should remain latent until relevant.

Valid forms:

- side inspector;
- bottom sheet;
- split panel;
- local expansion;
- disclosure row;
- modal only for a bounded decision or confirmation.

Required behavior:

- the trigger remains visible or recoverable;
- open state is announced to assistive technology;
- focus moves into the exposed layer when appropriate and returns on close;
- Escape closes a temporary layer;
- the primary task remains visible unless the secondary layer requires full attention;
- mobile uses a sheet or inline expansion rather than a narrow hidden desktop rail.

## Adaptive View States

The surface may reorganize through four explicit states.

### Focus

One task dominates. Secondary content recedes. Spacing expands and motion is minimal.

### Constellation

Relevant contexts move closer to the task. Related items appear without exposing the complete system.

### Control

The layout compresses to show state, dependencies, evidence and boundaries. This is where hidden planes may become visible for inspection.

### Transition

The origin remains perceptible while the next plane appears. The user sees what changed and what was preserved.

State changes must be reversible and visible. Do not infer a state solely from hidden profiling. Use current task, explicit user action, viewport, accessibility preferences and verified product state.

## Motion Contract

Motion explains relation, state or continuity.

Timing baseline:

- micro feedback: 90-140ms;
- control or local disclosure: 160-240ms;
- relational transition: 260-380ms;
- maximum ordinary transition: 480ms.

Rules:

- use movement to show origin and destination;
- prefer opacity plus short translation over scale-heavy effects;
- do not animate every card on scroll;
- do not run infinite ambient diagrams as proof of system activity;
- pause or remove non-essential animation outside the viewport;
- honor `prefers-reduced-motion` with static state, instant replacement or a short crossfade;
- never delay an action result to complete an animation.

## Diagram Contract

Use diagrams for process, relation, state, hierarchy or tension.

Required:

- a title that states the question answered;
- labels readable without hover;
- five to seven visible nodes before grouping;
- real source/state data when the diagram claims current operation;
- a static accessible summary;
- keyboard selection for interactive nodes;
- a reduced-motion state;
- no meaning carried by color alone.

Suitable visual systems:

- continuity line;
- layered semantic planes;
- source-to-result flow;
- intent lineage;
- context constellation;
- state and verification timeline;
- before/after fragmentation comparison.

## Typography

Use two voices and an optional data face.

- manifesto/display: condensed or strongly proportioned sans, reserved for short declarations;
- operational/human: open sans-serif with calm line spacing and sentence case;
- data/code: monospaced face for identifiers, evidence and machine-readable state.

Rules:

- body copy stays sentence case;
- uppercase is limited to short labels and manifesto fragments;
- do not use decorative Japanese text unless it is accurate, translated and relevant;
- do not place long copy inside color fields when a nearby paper field can carry it;
- headings may be large, but the action and context labels must remain the strongest functional anchors.

## Component Rules

Buttons:

- one primary action per decision field;
- system blue or intent red may carry a primary action according to meaning;
- yellow uses dark text;
- green is not a generic primary button; reserve it for active/verified continuity states and positive completion.

Cards:

- use for discrete records, not every paragraph;
- an unselected card should not be more visually prominent than the active context;
- use borders, spacing and surface contrast before shadows;
- preserve the shared 4px control / 8px card radius contract.

Selectors:

- selected state uses label, icon or check in addition to color;
- options may expose related semantic planes without navigating away;
- avoid novelty controls when a native select, tabs or segmented buttons are clearer.

## Machine-Readable Orientation

Use the existing public orientation schema where possible:

```html
data-agent-marker="adaptive-semantic-surface"
data-agent-active="true"
data-agent-focus="current-intent"
data-agent-relation="source-to-result"
data-agent-boundary="human-review"
```

Candidate extensions, not yet promoted:

```html
data-agent-plane="context|project|knowledge|tool|model|result"
data-agent-view-state="focus|constellation|control|transition"
data-agent-disclosure="primary|secondary|latent"
```

Do not expose private model reasoning or hidden user profiling through attributes.

## Responsive Contract

At minimum verify:

- 375px, 768px, 1024px, 1366px and wide desktop;
- no horizontal page overflow;
- the primary intent remains above secondary diagrams on mobile;
- diagrams become a scrollable local object only when labels remain readable;
- drawers become bottom sheets or inline disclosures on narrow screens;
- typography does not force single-word stacking unless deliberately used for one manifesto statement;
- touch targets meet 44px minimum size;
- sticky controls do not obscure content or browser UI;
- theme fields retain contrast in high contrast and forced-colors modes where possible.

## Accessibility And Adaptation Boundary

The system may adapt:

- density;
- suggested next actions;
- disclosure depth;
- local field balance;
- diagram detail;
- motion detail;
- order of non-critical supporting content.

The system may not silently adapt:

- destructive action position;
- action meaning or label;
- keyboard order;
- required consent or verification;
- accessibility preferences;
- hidden data collection;
- public claims about current capability.

Provide controls to restore the baseline layout and to disable adaptive presentation.

## Candidate Acceptance Tests

Before promotion, demonstrate:

1. one public narrative page in Paper mode;
2. one operational or inspection state in Ink mode;
3. one Hybrid transition preserving context and focus;
4. progressive disclosure on desktop and mobile;
5. a real explanatory diagram with static fallback;
6. reduced-motion behavior;
7. keyboard and screen-reader navigation;
8. contrast verification for all semantic color pairs;
9. no fabricated operational state;
10. a documented path back to the baseline layout.

## Extraction Rule

```text
preserve truth, not current copy;
preserve orientation, not current page order;
preserve relations, not decorative diagrams;
preserve user control, not automatic spectacle.
```

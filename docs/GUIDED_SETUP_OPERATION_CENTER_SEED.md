# Guided Setup Operation Center Seed

Status: candidate behavior seed.
Source pressure: AIMAIL P1.6 product/UI review, 2026-06-26.

## Purpose

Use this seed when a product must serve two audiences in one surface:

```text
first-time or non-technical user -> ultra-simple setup path
returning/operator user -> multifunction operation center
hands-free/mobile user -> voice-first control and short decisions
agent/coder/reviewer -> inspectable state, policy, logs and boundaries
```

This pattern prevents the first screen from becoming a developer dashboard while
preserving the deeper operational surface needed by an agentic product.

## Core Shape

```text
Setup First
-> activates safe baseline
-> unlocks operational tabs
-> exposes advanced inspector only when needed
```

The first screen should answer:

```text
who are you?
which source is connected or simulated?
how should actions be controlled?
what is allowed, ask-first or blocked?
what can the user do now?
```

## Recommended Surface Model

### 1. Setup

Purpose: let a non-technical user reach a safe working state.

Visible components:

```text
identity card;
source/connect status;
control channel;
autonomy choice;
safety summary;
one primary continue/test action.
```

Rules:

```text
use plain language;
show technical labels only behind details;
one decision per step;
no hidden authority increase;
no credential collection unless the product has the full security flow.
```

### 2. Inbox / Event Field

Purpose: show incoming items or synthetic events as the active field.

Visible components:

```text
event list;
sender/source;
short situation label;
risk/status;
recommended next action.
```

Rules:

```text
the event label should name the user situation, not the internal classifier;
low-value technical metadata belongs behind detail;
selection updates the action field and inspector.
```

### 3. Action Field

Purpose: show what the assistant understood and what it proposes.

Visible components:

```text
message or event summary;
"what the assistant understood";
"recommended action";
primary action;
safe alternatives;
blocked reason when applicable.
```

Rules:

```text
primary action must be the safest high-probability command;
show whether action is simulated, draft-only, confirmation-required or live;
never make a blocked action look like a normal call to action.
```

### 4. Voice / Hands-Free Control

Purpose: support mobile, car, glasses or speaker use without relying on visual
scanning.

Visible components:

```text
short voice prompt;
allowed voice commands;
default safe command;
driving/focus restriction state.
```

Rules:

```text
one command at a time;
no long menus for driving mode;
ambiguous commands become ask/remind/block;
links, attachments, commitments, payment/legal and credentials remain blocked
or confirmation-required.
```

### 5. Inspector

Purpose: keep the system reviewable without dominating the main experience.

Visible components:

```text
policy precedence;
decision log;
memory candidate;
blocked actions;
source/provenance;
debug/reviewer notes.
```

Rules:

```text
collapsed by default for ordinary users;
open by default only in diagnostic or reviewer mode;
never replace the primary product flow with internal labels.
```

## Tab Unlock Model

Tabs become available after the setup baseline exists:

```text
Setup: always visible.
Inbox/Event Field: after source is connected or mock source is selected.
Assistant Action: after an item/event is selected.
Voice: after control channel exists.
Memory: after first memory candidate exists.
Inspector: always available to reviewers, collapsed for normal users.
Settings: available after setup, with advanced sections grouped.
```

## Copy Rules

Prefer user-language labels:

```text
"Needs your confirmation" over "confirmation_required".
"Can draft only" over "draft_confirm".
"Suspicious: I will not answer" over "blocked".
"I can read a summary" over "read_summary".
```

Keep machine labels in:

```text
data attributes;
logs;
developer/reviewer inspector;
test fixtures.
```

## Layout Rules

Use `Shell3Col` or an equivalent workspace only after the setup has a safe
baseline. Before setup is complete, use a simple guided panel or stepper.

For the operation center:

```text
left: sources, modes, event list, filters;
center: selected event, understanding, recommended action;
right: voice/control and inspector, collapsible by user mode.
```

Mobile:

```text
default to action field;
source list becomes drawer;
inspector becomes details sheet;
voice commands stay sticky or immediately reachable;
no horizontal scroll.
```

## Boundary Attributes

Outer surface should expose:

```tsx
data-agent-marker="guided-setup-operation-center"
data-agent-active="true"
data-agent-tab="{setup|inbox|action|voice|memory|inspector|settings}"
data-agent-focus="{selected item or setup step}"
data-agent-boundary="{mock-only|review-only|confirm-before-action|live}"
```

## QA Checklist

```text
setup can be understood without developer terms;
ordinary user can identify the next safe action in under 5 seconds;
advanced inspector can be hidden without losing the core flow;
voice mode has 2-4 clear commands for the selected event;
blocked states are visible but not visually dominant;
technical labels do not leak into primary copy;
mobile has no horizontal overflow;
all live/mutating actions declare side effects and confirmation gates.
```

## Do Not Use When

```text
the product is only a static article or landing page;
there is no setup/onboarding boundary;
the user never needs to move between simple mode and operator mode;
the surface has no assistant, policy, action or multidevice control layer.
```

## Promotion Rule

Keep this as a candidate until at least one product implementation proves:

```text
setup-first path works for a non-technical reviewer;
operation center supports repeated use;
hands-free commands remain safe;
inspector preserves policy/log/memory evidence without dominating the UI.
```

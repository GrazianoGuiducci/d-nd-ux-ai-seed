# Response Outline Seed

Status: reusable component + operating guide.

## Purpose

`ResponseOutlineRail` is a navigation memory for long answers, long chat
threads, agent logs and app pages that produce many consecutive blocks.

It does not replace the answer. It exposes the structure of the answer so the
user can move, compare and return without losing orientation.

## When To Use

Use it when at least one condition is true:

- a chat answer has more than 4 meaningful sections;
- an internal THIA chat has many turns with decisions, claims and actions;
- an app page has a long generated report inside a workspace;
- a response contains checks, findings, next actions and source traces;
- mobile users must jump between sections without scrolling blindly.

Do not show it for short answers. A rail with two items is visual noise.
Do not place the rail in a normal three-column workspace header or canvas just
because the workspace has selectable items. In that context it becomes a
competing navigation system. The rail belongs to the length of the generated
content: article passages, long reports, chat turns, question/answer anchors
and focal points created by diagrams.

## Component Contract

```tsx
import { ResponseOutlineRail } from './ResponseOutlineRail';

const outline = [
  { id: 'summary', label: 'Summary', kind: 'section', targetId: 'summary' },
  { id: 'risk', label: 'Risk found', kind: 'warning', targetId: 'risk' },
  { id: 'next', label: 'Next action', kind: 'action', targetId: 'next' },
];

<ResponseOutlineRail
  title="Response"
  mode="panel"
  activeId="risk"
  items={outline}
/>;
```

Modes:

- `rail`: compact vertical indicator, best at the side of a long reading surface;
- `panel`: readable menu, best inside a sidebar;
- `inline`: embedded block, best inside a response or mobile drawer.

Kinds:

```text
section, turn, step, claim, action, warning, result
```

## UX Rules

- Labels name the destination, not the UI action.
- Keep labels short: 2-6 words.
- Use `warning` only for real risks, regressions or failed checks.
- Use `claim` for statements that need evidence or validation.
- Use `action` for something the user or system can do.
- The active item should track scroll position when the host app can provide it.
- On mobile, put the outline in a drawer, sticky top strip or inline accordion.
- Do not duplicate the full answer in the rail.

## Agentic Use

For THIA-like chats, the rail should be generated from structured response
metadata when possible:

```ts
type ResponseBlock = {
  id: string;
  role: 'finding' | 'evidence' | 'decision' | 'action' | 'risk';
  title: string;
  targetId: string;
};
```

The chat can then expose the current surface to the assistant:

```tsx
data-agent-marker="response-outline"
data-agent-tab="chat"
data-agent-focus={activeId}
```

This lets an assistant know where the user is without relying on visible copy.

## Practical Pattern

For very long single answers, use a two-level structure:

```text
right rail: major answer sections
inside each long section: small inline outline for local subclaims
```

Do not nest rails visually. The inner outline should be an inline block near
the beginning of the long section.

## Boundaries

The outline is navigation and awareness. It is not proof, ranking or judgment.
If a section is uncertain, the answer body must carry the evidence; the outline
only marks that uncertainty exists.

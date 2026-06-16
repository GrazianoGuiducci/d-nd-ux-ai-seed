# External Generalization Plan

Status: public-language and compatibility plan.

The repository was born inside the D-ND / THIA design environment. That origin is useful internally, but public users should be able to adopt the seeds without needing to understand D-ND or THIA.

The external layer should describe the same behavior with generic agentic UX language.

## Public Positioning

Use:

```text
Agentic UX Seed
Reusable interface contracts for agentic workspaces.
```

Avoid making external users decode internal project names before they understand the value.

The public explanation should be:

```text
A portable set of React components, templates and operating guides for interfaces where humans and AI agents need shared orientation: visible context, active work field, consequence panels, machine-readable state and safe action boundaries.
```

## Naming Map

| Internal / legacy term | External term | Rule |
| --- | --- | --- |
| D-ND UX-AI Seed | Agentic UX Seed | Use external term in public copy; keep package name until a versioned rename is planned. |
| THIA chat | Agent context assistant | Use THIA only for internal D-ND surfaces. |
| `ThiaChatSeed` | `AgentContextChatSeed` | Add alias before renaming. Do not break existing imports. |
| `data-thia-*` | `data-agent-*` | Support both during transition. Document `data-agent-*` as public schema. |
| `dnd:thia:ask` | `agent:context:ask` | Support both events during transition. |
| `dnd-*` CSS classes | `agent-*` or component-scoped classes | Rename only in a major cleanup or keep aliases. |
| D-ND Design | Agentic UX Design | Use D-ND branding only where the origin matters. |
| THIA-style assistant | context-aware assistant surface | Public copy should describe the behavior. |

## Attribute Schema

Public schema:

```tsx
data-agent-marker="..."
data-agent-active="true"
data-agent-tab="..."
data-agent-focus="..."
data-agent-item="..."
data-agent-relation="..."
data-agent-count="..."
```

Optional:

```tsx
data-agent-subtab="..."
data-agent-mode="..."
data-agent-boundary="..."
data-agent-action="..."
```

Compatibility schema:

```tsx
data-thia-marker="..."
data-thia-active="true"
data-thia-tab="..."
data-thia-focus="..."
data-thia-item="..."
data-thia-relation="..."
data-thia-count="..."
```

The important concept is not the string `thia`. The important concept is that the UI exposes stable machine-readable orientation so assistants, tests and browser tools can understand the active surface without scraping visible prose.

## Event Schema

Public event:

```ts
window.dispatchEvent(new CustomEvent('agent:context:ask', {
  detail: {
    source: 'seed-menu',
    focus: 'Adoption guide',
    relation: 'Integration',
    prompt: 'Explain what must travel together.'
  }
}));
```

Compatibility event:

```ts
window.dispatchEvent(new CustomEvent('dnd:thia:ask', { detail }));
```

During transition, assistant surfaces should listen to both.

## Code Migration Phases

### Phase 0 — docs only

Keep current component names and attributes. Add this generalization plan and update public documentation.

### Phase 1 — compatibility aliases

Add generic aliases without removing current names:

```ts
export { default as AgentContextChatSeed } from './ThiaChatSeed';
export type { ThiaChatSeedProps as AgentContextChatSeedProps } from './ThiaChatSeed';
```

Then update examples to use the public alias.

### Phase 2 — dual attribute reader

Assistant/context utilities should read `data-agent-*` first, then fall back to `data-thia-*`.

```ts
const marker = el.dataset.agentMarker || el.dataset.thiaMarker;
```

### Phase 3 — dual event listener

Assistant surfaces should listen to both:

```ts
agent:context:ask
dnd:thia:ask
```

### Phase 4 — public examples

Demo and templates should use public names by default. D-ND / THIA examples can remain in an internal section.

## What Not To Remove

Do not remove the orientation schema. Rename it if needed, but preserve the behavior.

Do not flatten the repository into a visual design kit. It is a behavioral UX seed system for agentic interfaces.

Do not publish domain-heavy D-ND content as reusable seed content. The reusable part is the contract, not the mythology, copy or private workflow.

## Public One-Liner

```text
Reusable interface contracts for agentic workspaces: context panels, active fields, detail inspectors, machine-readable orientation and safe action boundaries.
```

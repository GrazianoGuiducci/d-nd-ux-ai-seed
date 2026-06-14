# Taxonomy System Seed

Status: data contract + simple component.

## Purpose

The taxonomy system is the invariant map that lets pages, tooltips, graphs,
chat context and generated articles refer to the same concept without
flattening it into one definition.

It should be treated as a navigation and context layer, not as proof.

## Data Contract

```ts
export interface TaxonomyNode {
  id: string;
  label: string;
  type?: string;
  description?: string;
  tags?: string[];
  status?: 'canonical' | 'candidate' | 'alias' | 'ambiguous' | 'scaffold' | 'rejected';
  parents?: string[];
  children?: string[];
  related?: string[];
}

export interface TaxonomyEdge {
  from: string;
  to: string;
  relation: string;
  weight?: number;
}
```

Statuses:

- `canonical`: stable node used publicly;
- `candidate`: plausible new node awaiting review;
- `alias`: likely alternative name for an existing node;
- `ambiguous`: needs human classification;
- `scaffold`: temporary structure used to organize work;
- `rejected`: kept as memory of a false path or non-useful term.

## Component Contract

```tsx
import { TaxonomyMap } from './TaxonomyMap';

<TaxonomyMap
  title="Concepts"
  selectedId="field"
  nodes={[
    { id: 'field', label: 'Field', status: 'canonical', tags: ['ux', 'context'] },
    { id: 'candidate-x', label: 'Candidate X', status: 'candidate' },
  ]}
  edges={[
    { from: 'field', to: 'candidate-x', relation: 'contains' },
  ]}
/>;
```

This component is intentionally simple. It is a readable inspector, not a graph
engine.

## UX-AI Use

Expose taxonomy state near the point of use:

```tsx
data-thia-marker="taxonomy-map"
data-thia-item={node.id}
data-thia-relation={node.type}
```

This allows a chat assistant, internal page helper or agentic tool to know
which conceptual layer the user is inspecting.

## Practical Rules

- A concept can have multiple explanations for different contexts.
- The node identity should remain stable while explanations vary.
- Keep tooltip text short; put canonical depth in a concept sheet.
- New automatic terms should enter as candidates, not canonical nodes.
- A rejected node should not disappear if it explains why a path was abandoned.

## Suggested Explanation Layers

```text
tooltip: one sentence
preview: short operational paragraph
page: canonical explanation with relations
agent context: compact machine-readable role
translation: language-specific copy tied to same node id
graph: relation-focused label
article: narrative explanation in local context
```

## Boundaries

The taxonomy supports orientation, retrieval and consistency. It must not make
authority claims by itself. Promotion to canonical status is a reviewed act in
the host system.

# Article Diagram Seed

Status: reusable component + integration guide.

## Purpose

`ArticleDiagramRail` extracts the diagram logic used in long D-ND articles:
nodes, passages, fields, tests, directions and results shown as a readable
process diagram.

It is useful when a reader must understand the movement of an idea, not only
consume paragraphs.

## Component Contract

```tsx
import { ArticleDiagramRail } from './ArticleDiagramRail';

<ArticleDiagramRail
  title="Pipeline"
  orientation="horizontal"
  nodes={[
    { id: 'source', label: 'Source', kind: 'source' },
    { id: 'field', label: 'Field', kind: 'field', active: true },
    { id: 'test', label: 'Control', kind: 'test' },
    { id: 'result', label: 'Result', kind: 'result' },
  ]}
/>;
```

Kinds:

```text
source, field, question, test, direction, result, void
```

Orientations:

- `horizontal`: best above article sections or inside a wide cardless band;
- `vertical`: best as a side guide or inside a long answer.

## Article Integration

If the host article system supports inline tags, keep the article readable
without the component:

```text
[[DIAGRAM:pipeline]]
```

The registry can map that tag to either:

- a custom diagram component for a canonical page;
- `ArticleDiagramRail` for generic process diagrams;
- a static SVG fallback for export contexts.

## UX Rules

- The diagram must explain sequence, relation or tension.
- Do not use it as decoration.
- Use at most 7 visible nodes in a single rail.
- If there are more nodes, group them into phases.
- Each node label should be short enough to fit without horizontal overflow.
- Tooltips/popovers can add depth, but the diagram must remain legible without
  hover.
- On mobile, prefer horizontal scroll for compact process maps and vertical
  flow for explanatory passages.

## Bridge To Long Responses

The same component can live inside generated answers when the response has an
internal process:

```text
input -> counter-pole -> test -> output -> next cycle
```

This is different from `ResponseOutlineRail`:

- outline = navigation through content;
- diagram = structure of the reasoning or process.

They can coexist, but they should not duplicate each other.

## Boundaries

Article diagrams are visual reasoning aids. They are not evidence by
themselves. Claims, sources and falsification logic must remain in the text or
in a dedicated evidence surface.

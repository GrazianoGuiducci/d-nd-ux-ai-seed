# D-ND UX-AI Seed

Reusable interface seeds for agentic workspaces.

This repository contains the current D-ND three-column workspace pattern:

```text
left context -> main field -> right detail
```

It is meant for dashboards, labs, graph workspaces, simulators, agentic control
surfaces and tools where the user must inspect, compare, select and act without
losing orientation.

It is not a landing-page kit.

## What Is Included

| Path | Purpose |
| --- | --- |
| `src/Shell3Col.tsx` | Three-column workspace shell with resize, collapse, persistent widths and mobile drawers. |
| `src/ui/HoverPopover.tsx` | Shared tooltip primitive with portal rendering and smart placement. |
| `src/ui/SplitPanel.tsx` | Two-panel resizable split primitive. |
| `src/LiveBadge.tsx` | Polling read-only signal for live public data. |
| `src/Tooltip.tsx` | Semantic tooltip wrapper for function/mechanism/expectation explanations. |
| `templates/Shell3ColWorkspaceSeed.tsx` | Copyable starter workspace. |
| `docs/SHELL3COL_WORKSPACE_SEED.md` | Operating guide and UX-AI rules. |
| `docs/PATTERN_CANDIDATES.md` | Extraction map for future UX-AI seeds. |

## Install / Copy

This is a seed, not a packaged design system yet.

Recommended use:

1. Copy `src/Shell3Col.tsx` and `src/ui/HoverPopover.tsx` into your React app.
2. Copy `templates/Shell3ColWorkspaceSeed.tsx`.
3. Replace the three panel bodies with your domain content.
4. Give each surface its own `leftStorage` and `rightStorage` keys.
5. Preserve the `data-thia-*` awareness attributes when building agentic UI.

## Minimal Usage

```tsx
import Shell3Col from './Shell3Col';

export function Workspace() {
  return (
    <div className="h-full overflow-hidden bg-slate-950 text-slate-100">
      <Shell3Col
        flat
        leftTitle="Field"
        rightTitle="Detail"
        leftStorage="my_surface_left"
        rightStorage="my_surface_right"
        minHeight="100%"
        leftOpenWidth={300}
        rightOpenWidth={340}
        left={{ body: <div className="p-4">Context</div> }}
        main={<div className="h-full overflow-auto">Main field</div>}
        right={{ body: <div className="p-4">Detail</div> }}
      />
    </div>
  );
}
```

## Design Rule

```text
workspace if multiple live contexts must stay visible;
narrative page if the user only needs to read forward.
```

Do not turn every page into a dashboard. Use this pattern only when the user
needs working memory, selection and consequences at the same time.

## License

This project is public source, but not open-source in the OSI sense.

It is licensed under the **PolyForm Noncommercial License 1.0.0**.

You may use, study, modify and share it for non-commercial purposes. You may
not resell it, package it as a paid product, or use it for commercial advantage
without written permission from the copyright holder.

Commercial licensing can be requested from the repository owner.

See `LICENSE` and `NOTICE`.

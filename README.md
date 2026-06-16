# D-ND UX-AI Seed

Reusable UX and UI seeds for agentic workspaces, public navigation surfaces,
labs, dashboards and tools.

This repository exists for D-ND internal consistency across projects, and for
external teams that need a clear model for dense human+AI interfaces. It is not
a landing-page kit and it is not a finished design system with every component
prebuilt. It is a seed library: copy, adapt, verify, then promote useful
patterns back into the shared model.

## Included

| Path | Purpose |
| --- | --- |
| `src/Shell3Col.tsx` | Three-column workspace shell with resize, collapse, persistent widths and mobile drawers. |
| `src/ui/HoverPopover.tsx` | Shared tooltip primitive with portal rendering and smart placement. |
| `src/ui/SplitPanel.tsx` | Two-panel resizable split primitive. |
| `src/LiveBadge.tsx` | Polling read-only signal for live public data. |
| `src/Tooltip.tsx` | Semantic tooltip wrapper for function/mechanism/expectation explanations. |
| `src/DesignPrimitives.tsx` | Shared radius tokens plus button, card and modal primitives. |
| `src/ResponseOutlineRail.tsx` | Chat/report response outline for long answers and internal app conversations. |
| `src/ArticleDiagramRail.tsx` | Reusable vertical/horizontal process diagram for articles and long responses. |
| `src/TaxonomyMap.tsx` | Simple taxonomy inspector and data contract for concept systems. |
| `src/MegaMenuSeed.tsx` | Megamenu seed for tabs, template families and subdomain navigation. |
| `src/ThiaChatSeed.tsx` | THIA-style assistant seed with focus awareness, drag, resize and persisted geometry. |
| `templates/Shell3ColWorkspaceSeed.tsx` | Copyable starter workspace. |
| `demo/` | Vite demo showing the seeds as one working UX surface. |
| `docs/` | Adoption rules, workspace behavior, response outline, diagrams, taxonomy and pattern candidates. |
| `skills/d-nd-ux-ai-seed/` | Portable agent skill for selecting and adopting these UX patterns in Codex or compatible systems. |

## Quick Start

```bash
npm install
npm run dev
```

Open the local Vite URL and test:

- desktop shell resize and collapse;
- mobile side drawers;
- split panel resize;
- taxonomy selection;
- tooltip behavior;
- button, card and modal primitives;
- megamenu navigation;
- THIA chat handoff and resize;
- local read-only `LiveBadge`.

Run checks before publishing or copying into another project:

```bash
npm run typecheck
npm run build
npm run pack:dry
```

## Use As A Package

The package exposes an ESM and UMD library build after `npm run build`:

```tsx
import { Shell3Col, ResponseOutlineRail, TaxonomyMap, ThiaChatSeed } from 'd-nd-ux-ai-seed';
```

React and React DOM are peer dependencies:

```text
react >= 18
react-dom >= 18
```

The primitives inject their own minimal CSS where needed. The demo and template
CSS are intentionally plain CSS so consumers are not required to use Tailwind.

## Use As A Copyable Seed

Recommended for product surfaces that need local adaptation:

1. Copy `src/Shell3Col.tsx` and `src/ui/HoverPopover.tsx`.
2. Copy secondary primitives only when needed: `SplitPanel`,
   `ResponseOutlineRail`, `ArticleDiagramRail`, `TaxonomyMap`, `Tooltip`,
   `DesignPrimitives`, `LiveBadge`.
3. Copy `templates/Shell3ColWorkspaceSeed.tsx` and
   `templates/Shell3ColWorkspaceSeed.css`.
4. Replace the three panel bodies with domain content.
5. Give each surface unique `leftStorage`, `rightStorage` and split storage
   keys.
6. Preserve machine-readable awareness attributes such as `data-thia-*` or map
   them to your own agent-orientation schema.

## Use As An Agent Skill

For Codex-style systems that support skills, copy `skills/d-nd-ux-ai-seed/`
into the local skills directory and invoke `$d-nd-ux-ai-seed` when selecting a
workspace, navigation, taxonomy, inspector or assistant-response pattern.

For systems without native skills, copy the `SKILL.md` body into the project
agent instructions and keep the repo docs/templates available as local
references. The important rule is that the agent must select the smallest
reusable unit before editing: component, template, or documented pattern.

## Design Rule

```text
workspace if multiple live contexts must stay visible;
narrative page if the user only needs to read forward.
```

Use the three-column shell when context, active field and consequences must
stay visible at the same time. For public pages, use these seeds to stabilize
navigation, process diagrams, local inspectors and response maps without
turning every page into a dashboard.

## Internal And External Model

For D-ND projects, this repo is the shared UX-AI extraction point. Patterns
created in product work should move here only after they have a reusable
behavior contract.

For external users, the useful contract is:

- extract behavior, not private content;
- expose state and boundaries visibly;
- keep machine-readable orientation attributes stable;
- document side effects before adding actions;
- verify desktop and mobile before promoting a pattern.

See `docs/ADOPTION_GUIDE.md`, `docs/INTEGRATION_CHECKLIST.md`,
`docs/DESIGN_PRIMITIVES.md`, `docs/MEGAMENU_SEED.md`, `docs/THIA_CHAT_SEED.md` and
`docs/PROMOTION_WORKFLOW.md`.

Use `docs/TEMPLATE_SOURCE_INVENTORY.md` to decide which existing D-ND public
surface or subdomain pattern should be extracted next.

Use `docs/THIA_DESIGN_SEED_LINKING.md` when linking this design seed from a
THIA seed or assistant runtime. Use `docs/PORTFOLIO_ENTRY.md` for the D-ND
portfolio/technical portfolio entry.

See `docs/COMPLETION_STATUS.md` for the current ready-baseline checklist.

## License

This project is public source, but not open-source in the OSI sense.

It is licensed under the **PolyForm Noncommercial License 1.0.0**.

You may use, study, modify and share it for non-commercial purposes. You may
not resell it, package it as a paid product, or use it for commercial advantage
without written permission from the copyright holder.

Commercial licensing can be requested from the repository owner.

See `LICENSE` and `NOTICE`.

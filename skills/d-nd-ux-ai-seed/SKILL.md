---
name: d-nd-ux-ai-seed
description: Reuse the D-ND UX-AI seed system for agentic workspaces, navigation models, inspector layouts, taxonomy views, assistant response outlines, and domain page templates. Use when Codex or another coding assistant needs to clone/adopt this repo, select coherent UI/UX patterns, create a new domain surface from existing templates, preserve D-ND design consistency, or evaluate which component/template/interaction should be copied into another project.
---

# D-ND UX-AI Seed

Use this skill as the operating guide for the `d-nd-ux-ai-seed` repository.
The repo is both a component library and a source cabinet for reusable D-ND UI/UX patterns.

## First Move

1. Inspect the target project or page before copying anything.
2. Read the seed inventory:
   - `README.md` for install/export surface.
   - `docs/TEMPLATE_SOURCE_INVENTORY.md` for reusable page/domain sources.
   - `docs/PATTERN_CANDIDATES.md` for candidate pattern maturity.
   - `docs/INTEGRATION_CHECKLIST.md` before copying components.
   - `docs/THIA_DESIGN_SEED_LINKING.md` when the target is THIA or an assistant runtime.
   - `docs/SHELL3COL_WORKSPACE_SEED.md` for the three-column workspace contract.
3. Choose the smallest reusable unit:
   - Component: `src/Shell3Col.tsx`, `src/ui/SplitPanel.tsx`, `src/ui/HoverPopover.tsx`.
   - Template: `templates/Shell3ColWorkspaceSeed.tsx` plus CSS.
   - Pattern documentation: docs-only guidance when code is not mature enough.
4. Preserve `data-thia-*` and awareness markers when moving UI across domains.

## Pattern Selection

Use `Shell3Col` when the workflow must keep context, active work, and consequences visible.

Use `SplitPanel` inside the main column when the user needs a resizable work surface and a secondary process/result surface. On mobile, prefer resizable top/bottom behavior over a hidden drawer unless the secondary surface is only occasional.

Use `ResponseOutlineRail` when long assistant output needs a visible map of sections, claims, actions, warnings, and results.

Use `TaxonomyMap` when a domain has canonical, candidate, ambiguous, or rejected concepts that must stay visible before promotion.

Use page/domain templates only after removing private project content and keeping only layout, navigation, interaction, and reusable copy skeletons.

Use `MegaMenuSeed` for tab families, route groups and subdomain navigation.

Use `ThiaChatSeed` when an assistant surface must know the active panel, focus
and `data-thia-*` context before discussing changes.

## Adoption Workflow

1. Clone or vendor the repo.
2. Run `npm install`, `npm run typecheck`, and `npm run build`.
3. Start the demo with `npm run dev` and verify desktop plus mobile/narrow view.
4. Copy the selected component/template into the target project or import from the package.
5. Rename storage keys, props, route labels, and awareness attributes for the target domain.
6. Verify overflow, drawer states, keyboard focus, resize bars, mobile stacking, and closed-book gutters.
7. Document any new reusable pattern in `docs/PATTERN_CANDIDATES.md` before promoting it.

## Boundaries

Do not copy private domain data, project-specific claims, live endpoint secrets, or internal operational memory into reusable templates.

Do not promote a pattern as stable until it has a documented contract, responsive behavior, and at least one rendered verification pass.

Do not invent a new shell when `Shell3Col` plus `SplitPanel` can express the workflow with configured panels.

## Extra Reference

Read `references/adoption-checklist.md` when the task is to move this seed into another repository, install it as a skill, or prepare it for external users.

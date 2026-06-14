# Promotion Workflow

Status: contribution and growth rule for new UX-AI seeds.

This repository will grow from D-ND projects and external use. A pattern should
be promoted only when its reusable behavior is clearer than its original
project content.

## Promotion Rule

```text
extract behavior, not content;
extract contract, not copy;
extract boundary, not promise.
```

## Required Evidence

Before adding a new seed, capture:

- source surface and reason for extraction;
- reusable behavior in one sentence;
- public props or data contract;
- responsive behavior;
- accessibility behavior;
- side-effect boundary;
- machine-readable awareness attributes;
- demo state;
- docs update;
- browser verification notes.

## New Pattern Checklist

1. Add the primitive under `src/` or `src/ui/`.
2. Export it from `src/index.ts`.
3. Add a focused demo state in `demo/DemoApp.tsx`.
4. Add or update a guide in `docs/`.
5. Add the pattern to `docs/PATTERN_CANDIDATES.md`.
6. Run `npm run typecheck`.
7. Run `npm run build`.
8. Run `npm run pack:dry`.
9. Verify the Vite demo in desktop and mobile browser widths.

## Do Not Promote

Do not promote:

- project-specific copy;
- private data or internal-only state;
- components that hide side effects;
- a dashboard shell that exists only for decoration;
- a tooltip, card, modal or graph tightly coupled to one domain;
- a pattern that has not been checked on mobile.

## Versioning Guidance

Use minor versions for new seeds and compatible props.

Use patch versions for docs, CSS fixes, accessibility fixes and type fixes.

Use major versions when a prop contract, exported name or default behavior
changes in a way that can break consuming projects.

## Review Language

Every promoted seed should be explainable in this form:

```text
This seed helps a user [do task] while preserving [orientation/state/boundary].
It does not execute [side effect] by itself.
It becomes unsafe or misleading when [known misuse].
```

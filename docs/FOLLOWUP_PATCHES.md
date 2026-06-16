# Follow-Up Patches

Status: remaining local patches for Codex.

The first implementation pass added public aliases, orientation helpers, assistant public events, design primitive refinements, registry, skill, QA checklist, package metadata and README updates.

The current tool session could not patch these component files directly, so Codex should complete them locally and run the build.

## Remaining Code Patches

1. `src/ResponseOutlineRail.tsx`
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Preferred approach: use `agentOrientationAttributes` from `src/agentOrientation.ts`.

2. `src/ArticleDiagramRail.tsx`
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Surface value should remain `article-diagram`.

3. `src/TaxonomyMap.tsx`
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item`, `data-agent-relation` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Surface value should remain `taxonomy-map`.

4. `demo/DemoApp.tsx`
   - Prefer the public event path through `dispatchAgentContextAsk`.
   - Keep compatibility with `dnd:thia:ask` through the helper.
   - Use public labels by default: Agentic UX Seed, Agent Context Assistant, orientation attributes.
   - Use `AgentButton`, `AgentCard` and `AgentModal` in public examples.

## Verification

Run locally:

- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run pack:dry`

No GitHub CI status was available for the final commit in this session, so local verification is required.

## Optional Next Refinements

- Add keyboard arrow navigation to `MegaMenuSeed`.
- Add localized status labels to `TaxonomyMap`.
- Add grouping behavior to `ArticleDiagramRail` for more than seven nodes.
- Add host guidance or an auto-hide rule to `ResponseOutlineRail` for short content.

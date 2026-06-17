# Follow-Up Patches

Status: completed on 2026-06-17 by TM7-vps.

The first implementation pass added public aliases, orientation helpers, assistant public events, design primitive refinements, registry, skill, QA checklist, package metadata and README updates.

The remaining public-orientation patches have been applied. Keep this file as
the audit trail for what was closed and what remains optional.

## Remaining Code Patches

1. `src/ResponseOutlineRail.tsx` - done
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Preferred approach: use `agentOrientationAttributes` from `src/agentOrientation.ts`.

2. `src/ArticleDiagramRail.tsx` - done
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Surface value should remain `article-diagram`.

3. `src/TaxonomyMap.tsx` - done
   - Emit public `data-agent-marker`, `data-agent-count`, `data-agent-item`, `data-agent-relation` and `data-agent-focus`.
   - Keep existing `data-thia-*` attributes.
   - Surface value should remain `taxonomy-map`.

4. `demo/DemoApp.tsx` - done
   - Prefer the public event path through `dispatchAgentContextAsk`.
   - Keep compatibility with `dnd:thia:ask` through the helper.
   - Use public labels by default: Agentic UX Seed, Agent Context Assistant, orientation attributes.
   - Use `AgentButton`, `AgentCard` and `AgentModal` in public examples.

## Verification Required After Any Future Edit

Run locally:

- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run pack:dry`

For the 2026-06-17 closure, TM7-vps ran these checks before publication.

## Optional Next Refinements

- Add keyboard arrow navigation to `MegaMenuSeed`.
- Add localized status labels to `TaxonomyMap`.
- Add grouping behavior to `ArticleDiagramRail` for more than seven nodes.
- Add host guidance or an auto-hide rule to `ResponseOutlineRail` for short content.

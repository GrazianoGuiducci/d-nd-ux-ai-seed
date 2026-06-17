# Codex Refinement Tasks

Status: implementation queue after repository audit.

Use this file when Codex, Claude Code or another coding agent works on `GrazianoGuiducci/d-nd-ux-ai-seed`.

## Prime Directive

Do not convert this repository into a visual-only design system.

It is an agentic UX seed system. Every useful element must preserve:

```text
surface type
state visibility
machine-readable orientation
storage / persistence
responsive behavior
action boundary
adoption contract
```

## P0 — Public Generalization Without Breaking Current Users

Status 2026-06-17: complete. Public aliases, `data-agent-*` orientation,
`agent:context:ask` handoff and generic demo copy are implemented. Internal
`ThiaChatSeed`, `data-thia-*` and `dnd:thia:ask` compatibility remains.

### 1. Add public aliases

Add generic names while keeping current exports.

Recommended in `src/index.ts`:

```ts
export { default as AgentContextChatSeed } from './ThiaChatSeed';
export type { ThiaChatSeedProps as AgentContextChatSeedProps } from './ThiaChatSeed';
```

Optional later:

```ts
export { default as AgentWorkspaceShell } from './Shell3Col';
```

Do not remove `ThiaChatSeed` until a versioned release plan exists.

### 2. Read both orientation schemas

Update assistant/context readers to prefer `data-agent-*` and fall back to `data-thia-*`.

Target: `src/ThiaChatSeed.tsx`, function `readDomFocus()`.

Required behavior:

```ts
surface: el.dataset.agentMarker || el.dataset.thiaMarker
```

Apply the same rule for `tab`, `focus`, `item`, `relation`, `count` and `boundary`.

### 3. Listen to both handoff events

Current event:

```text
dnd:thia:ask
```

Public event to add:

```text
agent:context:ask
```

The handler can be shared. The public event should not remove the internal one.

### 4. Update demo labels

Change public-facing demo copy from D-ND / THIA wording to generic wording.

Examples:

| Current | Replace with |
| --- | --- |
| D-ND UX-AI Seed | Agentic UX Seed |
| THIA chat | Agent context assistant |
| Powered by D-ND Design | Agentic UX Seed |
| `data-thia-* preserved` | orientation attributes preserved |

Keep a small note that D-ND / THIA is the origin of the extraction.

## P1 — Package Hygiene

Status 2026-06-17: complete for the ready baseline. `package.json` has
repository metadata, keywords, empty runtime `dependencies`, React peer
dependencies and `pack:dry` verification.

### 1. Review dependencies

`package.json` currently contains runtime dependencies that appear to be build-tool transitive packages. For a React library, most should remain in `devDependencies`, while React stays in `peerDependencies`.

Check whether these are needed at runtime before publishing:

```text
csstype
detect-libc
fdir
js-tokens
lightningcss
lightningcss-win32-x64-msvc
loose-envify
nanoid
picocolors
picomatch
postcss
rolldown
scheduler
source-map-js
tinyglobby
```

Expected result: keep only real runtime dependencies, if any.

### 2. Add repository metadata

Add when stable:

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/GrazianoGuiducci/d-nd-ux-ai-seed.git"
},
"keywords": ["agentic-ui", "ux-ai", "react", "workspace", "design-system", "ai-agents"]
```

Keep license as PolyForm Noncommercial unless commercial licensing changes.

### 3. Add explicit build verification doc

Add or expand docs with:

```text
npm install
npm run typecheck
npm run build
npm pack --dry-run
```

## P2 — Component Contract Improvements

### Shell3Col

- Added optional `orientation` prop so host apps can emit `data-agent-*`
  and compatibility `data-thia-*` from the shell without manual duplication.
- Keep current `data-left-state` / `data-right-state` unchanged.
- Add docs for external storage key naming: `<app>_<surface>_<left|right>`.

### SplitPanel

- Add callback props for panel collapse/reopen events.
- Persist first/second collapsed state only if the host opts in.
- Confirm keyboard behavior in vertical mobile mode.

### HoverPopover / Tooltip

- Consider moving generic `.lab-tip-*` classes to neutral names, keeping legacy class aliases if required.
- Add `aria-describedby` pattern if the host needs formal tooltip association.

### ResponseOutlineRail

- Add optional `autoHideBelow?: number` or document that the host should hide rails with fewer than three items.
- Support `data-agent-*` alongside `data-thia-*`.

### ArticleDiagramRail

- Add grouping contract for more than seven nodes.
- Support `data-agent-*` alongside `data-thia-*`.

### TaxonomyMap

- Add optional `statusLabels` and `relationLabel` renderers for localization.
- Support `data-agent-*` alongside `data-thia-*`.

### MegaMenuSeed

- Consider renaming CSS class prefix from `.dnd-mega-*` to `.agent-mega-*` with compatibility aliases.
- Add keyboard arrow navigation if this becomes a primary navigation component.

### ThiaChatSeed / AgentContextChatSeed

- Generic public alias added.
- Reads `data-agent-*` first.
- Listens to `agent:context:ask` first.
- Keep internal D-ND / THIA compatibility.
- `brand` prop added so public use does not inherit green THIA styling by default.

## P3 — Missing Useful Seeds

Promote from `docs/TEMPLATE_SOURCE_INVENTORY.md` in this order:

1. `PublicNavShell`
2. `SiteMapMegaPanel`
3. `DomainStartPage` template
4. `DomainCycleDiagram`
5. `ConceptCloud`
6. `SideActionRail`
7. `CommandPanel`
8. `FaqAccordion`
9. `OfferTierGrid`
10. `CopyToAiBridge`
11. `EasyAction`
12. `ContributionIntake`

Each extraction must include:

```text
component/template
doc page
data contract
mobile behavior
side-effect boundary
copy slots
verification notes
```

## Acceptance Checklist For Any PR

Before opening or merging a PR, answer:

```text
Which surface type is this?
Which seed is the smallest complete unit?
Which linked primitives must travel with it?
Which storage keys must be renamed?
Which orientation attributes must remain stable?
Which responsive states were verified?
Which internal names remain, and why?
Which side effects are impossible, review-only, or real?
```

## Do Not Do

- Do not remove `data-thia-*` until all internal surfaces have migrated.
- Do not expose private THIA behavior as public backend logic.
- Do not import whole D-ND pages into the seed repo.
- Do not add decorative components without an agentic orientation or action boundary.
- Do not use visual consistency as the only reason for promotion.

# UX-AI Pattern Candidates

Status: extraction map for new projects.

This file tracks patterns observed in D-ND interfaces that are worth turning
into reusable seeds. Do not copy domain-heavy components blindly. Extract the
behavior, then rebuild the domain content outside the primitive.

## Promoted Now

| Pattern | Current artifact | Why it is ready |
| --- | --- | --- |
| 3-column workspace | `Shell3Col` | Mature across Graph, Insights and Potential surfaces. |
| Hover tooltip / popover | `HoverPopover`, `Tooltip` | Shared portal behavior, smart placement, hover intent. |
| Design primitives | `DesignPrimitives` | Shared radius contract plus button, card and modal baseline. |
| 2-panel split | `SplitPanel` | Generic resize/persistence/mobile stack. |
| Live read-only signal | `LiveBadge` | Simple polling, fallback, no side effect. |
| Response outline rail | `ResponseOutlineRail` | Generic orientation for long answers, chats, reports and app pages. |
| Article diagram rail | `ArticleDiagramRail` | Extracted process-diagram behavior without D-ND article content. |
| Taxonomy inspector | `TaxonomyMap` + guide | Stable data contract for concepts, candidates and relations. |

## Next Extraction Candidates

| Candidate | Source surface | Reusable core | Extraction risk |
| --- | --- | --- | --- |
| Floating panel | `Chatbot`, `BiconoLab` | Drag, resize, persisted geometry, z-index focus, mobile bottom sheet. | Medium: current behavior is mixed with chat/domain state. |
| Contextual starters | `Chatbot`, `CECPage`, `CommunityIntakeForm` | Starter chips derived from current page/surface/selection. | Medium: prompt copy must become data-driven. |
| Easy actions | `SitemanStudio`, `AZIONI_FACILI_UX_AI_KERNEL.md` | Named action -> procedure -> expected output -> human review stop. | Medium: action execution must stay app-specific. |
| Contribution intake | `CommunityIntakeForm`, `CommunityExitIntake` | Low-friction trace capture with local fallback and THIA handoff. | High: privacy, endpoint and consent rules must be explicit. |
| Copy-to-AI bridge | `IntegraAiCta` | Copy prepared context into another AI without losing intent. | Low: make copy text data-driven. |
| Narrative close CTA | `CTAChiusura` | Reading -> recognition -> next passage; CTA as consequence, not sales. | Low: needs copy slots and route config. |
| Section card/home | `SectionCard`, `SectionHome` | Progressive depth: live, concept, eco/list. | Medium: currently tied to site routing/language store. |
| Live dashboard tile | `DashboardTile`, consciousness cards | Stable metric tiles with no layout shift. | Low-medium: visual tokens need cleanup. |
| Knowledge graph inspector | `KnowledgeGraph`, `LabGraph` | Selectable graph -> side detail -> mobile drawer on selection. | High: graph data and renderer are domain-heavy. |
| Glossary / concept sheet | `GlossaryLayer` | Inline concept bridge; desktop tooltip, mobile bottom sheet. | Medium-high: current glossary is domain-specific. |
| Awareness markers | `data-thia-*` across Lab/Chat/Forms | Machine-readable UI orientation for agents. | Low: codify schema first. |
| Navigation surface model | Public pages, app tabs, workspace route groups | Route intent, adjacent surfaces, selected item and next safe action. | Medium: copy and routing must stay separate. |
| Public domain template pack | Lab D-ND / start / Seed public pages | New domain pages assembled from tested sections, diagrams, menus and intake blocks. | Medium: content slots and route model must be separated. |
| Site map mega-panel | d-nd.com map navigation | Wide orientation panel for complex public ecosystems. | Medium: must not obscure current task or mobile reading. |
| Side action rail | Lab feedback/support rails | Persistent feedback/support/contact entry point. | Low: keep labels short and avoid content overlap. |
| Assistant surface pack | THIA / DOMUS chat | Floating assistant, intake split, contextual starters and page awareness. | High: state, API and copy are coupled. |
| Guided setup operation center | AIMAIL P1.6/P1.7 pressure | Non-technical setup unlocks a multifunction agentic operation center with voice, inspector and multidevice control. | Medium: must not turn every product into a dashboard; copy must stay user-facing while logs remain inspectable. |

## Priority Order

1. `FloatingPanelSeed`
2. `ContextualStarterBar`
3. `EasyAction`
4. `AwarenessMarkers`
5. `CopyToAiBridge`
6. `ContributionIntake`
7. `SectionPath`
8. `ConceptSheet`
9. `NavigationSurfaceModel`
10. `PublicDomainTemplatePack`
11. `SiteMapMegaPanel`
12. `SideActionRail`
13. `GuidedSetupOperationCenter`

## Extraction Rule

```text
extract behavior, not content;
extract contract, not copy;
extract boundary, not promise.
```

## Candidate Contracts

### FloatingPanelSeed

Required:

- drag from title bar only;
- resize from edge/corner handles;
- persisted position and size;
- z-index focus on interaction;
- viewport clamp;
- mobile bottom sheet fallback;
- ESC closes or exits edit mode;
- body scroll lock only while modal/drawer is active.

### ContextualStarterBar

Required:

- 2-5 starters maximum;
- starters derive from route, selected object, mode or visible section;
- no long prompts in the button label;
- action/result boundary in the prompt payload;
- mobile wraps without horizontal overflow.

### EasyAction

Required:

- visible name;
- action class;
- procedure;
- required sources/tools;
- expected output;
- stop boundary for human review;
- side-effect declaration.

### AwarenessMarkers

Required attributes:

```tsx
data-thia-marker
data-thia-active
data-thia-tab
data-thia-focus
data-thia-item
data-thia-relation
data-thia-count
```

Optional:

```tsx
data-thia-subtab
data-thia-mode
data-thia-boundary
data-thia-action
```

These are not visible copy. They are orientation for assistants, automations and
future UX-AI agents.

### ResponseOutlineRail

Required:

- generated from section/turn metadata when possible;
- hidden for short answers;
- active item follows scroll or selected response block;
- labels stay short and never duplicate full answer text;
- mobile fallback is drawer, sticky strip or inline block;
- kinds mark function: section, turn, claim, warning, action, result.

### ArticleDiagramRail

Required:

- shows process, relation or tension, never decoration;
- max 7 visible nodes before grouping;
- usable horizontally in articles and vertically beside long responses;
- text remains readable without hover;
- deeper explanation belongs in tooltip/popover or body copy.

### TaxonomyMap

Required:

- stable node id;
- explicit status for candidate/alias/ambiguous/scaffold/rejected;
- no automatic candidate promotion;
- relation labels are data, not hardcoded copy;
- usable as context for AI without claiming authority.

### GuidedSetupOperationCenter

Required:

- setup-first entry for non-technical users;
- safe baseline before operational tabs unlock;
- separate primary product flow from reviewer/debug inspector;
- voice/hands-free control with 2-4 commands per event;
- explicit mode/policy boundary before any action;
- technical labels kept in logs and data, not primary copy;
- multidevice model: desktop workspace, mobile action-first layout,
  hands-free command surface and inspector details sheet;
- no live/mutating action without visible side-effect and confirmation gate.

## Do Not Promote Yet

| Component | Reason |
| --- | --- |
| Full `Chatbot.tsx` | Too much public THIA logic, API behavior, UI state and copy are coupled. |
| Full `LabGraph.tsx` | Domain data, graph physics and UI are still one large surface. |
| Full `BiconoLab.tsx` | Good floating-window mechanics, but mixed with bicone domain rendering. |
| Full `SitemanStudio.tsx` | Valuable action grammar, but too operational and authenticated. |

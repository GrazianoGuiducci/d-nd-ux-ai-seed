# Agentic UX System Spec

Status: operating model for this repository.

This repository is the place where reusable interface behavior is extracted from working products and turned into portable UX-AI seeds.

It serves two audiences:

1. internal operators and coding agents that need stable UI elements for THIA / D-ND surfaces;
2. external teams, tools and AI coders that need the same behavior without importing project-specific language.

The public contract is therefore:

```text
observe working UI -> extract behavior -> define contract -> build seed -> document adoption -> verify responsive states -> promote or keep as candidate
```

## What The System Learns

The repository should not learn by accumulating visual fragments. It should learn by preserving behaviors that survive use.

A useful seed records:

- the surface type;
- the smallest complete component set;
- the data contract;
- the orientation attributes an assistant can read;
- the storage and persistence rules;
- the responsive states that must be tested;
- the side-effect boundary;
- the promotion conditions.

## Core Surfaces

| Surface | Role | Current seed |
| --- | --- | --- |
| Dense workspace | Keep context, active field and consequence visible together. | `Shell3Col` |
| Inner split | Keep two related panels resizable without losing recovery gutters. | `SplitPanel` |
| Tooltip / popover | Explain local function without clipping or duplicate implementations. | `HoverPopover`, `Tooltip` |
| Long response map | Let users return to sections, warnings, actions and results. | `ResponseOutlineRail` |
| Process diagram | Show movement, sequence, relation or tension near prose. | `ArticleDiagramRail` |
| Concept inspector | Keep canonical/candidate/ambiguous/rejected concepts visible. | `TaxonomyMap` |
| Navigation contract | Group routes, tabs and template families with active state. | `MegaMenuSeed` |
| Assistant surface | Read active UI context before discussing changes. | `ThiaChatSeed` |

## Agentic UX Loop

Each new UI pattern should pass through this loop before promotion.

### 1. Field observation

Identify the working source surface and the behavior that actually helps orientation, inspection, action or recovery.

Do not copy the page as-is. Extract the behavior.

### 2. Contract extraction

Write the reusable contract:

```text
inputs
state
events
storage
attributes
mobile behavior
failure states
side effects
```

### 3. Seed implementation

Build the smallest component or template that preserves the behavior without private content.

### 4. Adoption guide

Document what must travel with the component. Most regressions happen when a coder copies the visual component but leaves behind storage keys, event names, responsive behavior or orientation markers.

### 5. Verification

Every promoted seed must be checked at:

```text
375px
768px
1024px
1366px
1920px or one wide desktop viewport
```

The check is behavioral, not only visual.

### 6. Promotion / residue

If the seed holds across at least one existing surface and one new target, promote it.

If it fails, keep the failure as residue in docs instead of deleting the path. A rejected or stalled pattern can explain why a future extraction should not repeat the same mistake.

## Memory Artifacts

The repo should keep these artifacts stable:

| Artifact | Purpose |
| --- | --- |
| `README.md` | Public orientation and quick adoption. |
| `docs/ADOPTION_GUIDE.md` | When to use each seed and what must be preserved. |
| `docs/INTEGRATION_CHECKLIST.md` | Practical checklist before copying into another project. |
| `docs/PATTERN_CANDIDATES.md` | Extraction queue and promotion status. |
| `docs/TEMPLATE_SOURCE_INVENTORY.md` | Source map from existing sites/subdomains/products. |
| `docs/EXTERNAL_GENERALIZATION_PLAN.md` | Public naming and migration away from internal terms. |
| `docs/CODEX_REFINEMENT_TASKS.md` | Concrete next tasks for Codex / Claude Code / external coders. |

## Operating Rule

```text
extract behavior, not content;
extract contract, not copy;
extract boundary, not promise.
```

A visual element becomes a seed only when a coder can reuse it without knowing the original project mythology.

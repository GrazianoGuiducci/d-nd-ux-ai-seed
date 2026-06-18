# GPT Review Context

Purpose: orient an external GPT review of `d-nd-ux-ai-seed` without mixing this
design repository with business/outreach state or runtime memory.

## What This Repository Is

`d-nd-ux-ai-seed` is a skill-first UX-AI repository. Its primary object is an
agent skill that guides complete UX ports for agentic workspaces, navigation
models, inspector layouts, taxonomy views and assistant response outlines.

The React components, templates and docs are reference evidence used by the
skill. They are not the product by themselves.

It is not the D-ND business manager, not the public portfolio, not a live site,
and not a runtime memory repository.

## Skill Already Included

The relevant agent skill is already part of this repository:

```text
skills/d-nd-ux-ai-seed/SKILL.md
skills/d-nd-ux-ai-seed/references/adoption-checklist.md
skills/d-nd-ux-ai-seed/agents/openai.yaml
```

This is the skill to review for UX-seed adoption. It should guide an agent that
needs to choose the smallest complete UX unit from this repo: behavior contract,
required components, storage keys, responsive states and documented pattern.

Current local validation result:

```text
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\PVSC\ANTI_G\d-nd-ux-ai-seed\skills\d-nd-ux-ai-seed
Skill is valid!
```

## What To Review

Review the repository for:

- clarity of the seed model: skill-first behavior contracts, with components and templates as references;
- consistency between `README.md`, `docs/`, `templates/`, `src/` and the skill;
- whether the skill gives enough guidance for another agent to adopt the seeds;
- missing adoption boundaries, validation steps or anti-confusion notes;
- usefulness for external teams that need dense human+AI interfaces.

## What Not To Mix In

Do not import D-ND Business Manager state into this repository unless the
operator explicitly asks for a business-facing document.

The local business/PR skill is separate:

```text
C:\PVSC\ANTI_G\.codex\skills\dnd-business-manager
C:\PVSC\ANTI_G\dnd-business-manager
```

That skill is for portfolio, LinkedIn, AI4I, outreach, collaboration proposals
and public claim boundaries. It is not a design-seed skill.

## Preferred Output From GPT

If GPT proposes changes, ask it to return them as one of:

- `incoming/GPT_REVIEW_DND_UX_AI_SEED_<date>.md` in a separate review package;
- a concise patch proposal grouped by file;
- a prioritized issue list with severity, rationale and suggested edit.

Do not ask GPT to rewrite the whole repo at once. Prefer bounded suggestions.

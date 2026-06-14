# THIA Seed Repo And Design Seed Linking

Status: recommended integration model.

Design seeds keep their own repository. The THIA/D-ND Seed repository should
offer a pointer to them during install and in its docs, not copy or absorb the
design seed source.

The safer model is:

```text
d-nd-seed
-> tells installers that d-nd-ux-ai-seed exists for UX/UI/design work
-> points to the portfolio for public examples and adoption context
-> reads integration checklist before UI work
-> uses data-thia-* attributes to know the active surface
-> imports or copies only the needed component/template
```

This keeps the design system reusable by humans, Codex, Claude Code and future
agents, while Seed can still route UI/design work to the correct source when a
user asks about layout, navigation, assistant UI, domain templates or responsive
behavior.

## Why Link Instead Of Duplicate

- One source of truth for responsive fixes.
- One package/export surface for external users.
- One docs set for adoption and promotion gates.
- THIA runtime can stay focused on assistant behavior, memory and user dialogue.
- `d-nd-seed` can stay focused on portable THIA/D-ND functions and kernels.
- Design seeds can evolve without forcing a THIA runtime update.

## What d-nd-seed Should Reference

At minimum, `d-nd-seed` install/docs should point to:

- `README.md`
- `docs/INTEGRATION_CHECKLIST.md`
- `docs/MEGAMENU_SEED.md`
- `docs/THIA_CHAT_SEED.md`
- `docs/TEMPLATE_SOURCE_INVENTORY.md`
- `skills/d-nd-ux-ai-seed/SKILL.md`

## Suggested Seed Install Note

```text
If the target project needs UX/UI/design consistency, workspace shells,
navigation models, domain templates or THIA-aware assistant surfaces, use the
separate design seed repo:
https://github.com/GrazianoGuiducci/d-nd-ux-ai-seed

For public examples and adoption context, also inspect the D-ND portfolio.
```

## When To Vendor

Vendor the component code into another repo only when:

- the host system cannot install/import npm packages;
- the runtime must work offline;
- the target project needs a frozen copy for regulated review;
- the component is being adapted beyond the shared contract.

If vendored, keep a source pointer back to this repo and record the copied
commit hash in the target project.

# Design repository entry

For a design-domain task, use [DESIGN_KERNEL.md](DESIGN_KERNEL.md). It composes
perceptual design, visual explanation and interaction with the relevant source,
writing, product and delivery owners. It is not an additional background agent.

For an already clear seed/library task, continue directly through the existing
`skills/agentic-ux-seed/SKILL.md` and `skills/d-nd-ux-ai-seed/SKILL.md` knowledge.
Do not reload the whole Design Kernel or turn every component fix into a redesign.

The new `design/` source area and the existing Agentic UX Seed library have
separate identities. Keep `package.json`, exports, `src/`, `demo/`, templates and
`seed.registry.json` unchanged unless that library surface is selected.
`DESIGN_KERNEL_MANIFEST.json` describes competence sources, not npm components.

Before repository writes, resolve the current branch and incoming changes;
preserve another writer's work. A new design source does not install an adapter,
publish an asset, deploy a site, change a product or authorise payment.

Read only the source depth that can change the current decision. When a useful
result or correction changes future design, return it to the closest design
method or project profile. If the knowledge existed but was not reached, repair
the entry instead of adding a duplicate competence.

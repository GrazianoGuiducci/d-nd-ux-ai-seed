# Adoption Checklist

Use this checklist when a project wants to consume `d-nd-ux-ai-seed`.

## Clone And Verify

- Clone `GrazianoGuiducci/d-nd-ux-ai-seed`.
- Run `npm install`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `npm run dev` and inspect the demo.

## Use As A Component Source

- Import or copy `Shell3Col` for workspace shells.
- Import or copy `SplitPanel` for inner resizable panels.
- Import or copy `HoverPopover` instead of creating local tooltip variants.
- Import or copy `DesignPrimitives` for shared buttons, cards, modals and radius tokens.
- Import or copy `MegaMenuSeed` for tab, route and template-family navigation.
- Import or copy `ThiaChatSeed` when the assistant must see the active surface and focused panel.
- Keep storage keys unique per target app.
- Preserve keyboard access and focus-visible states.

## Use As A Template Source

- Start from `templates/Shell3ColWorkspaceSeed.tsx`.
- Replace only panel bodies and domain copy.
- Keep layout, drawer, resize, gutter, and awareness behavior intact.
- Add target-domain routes, navigation labels, diagrams, and assistant surfaces as data.
- Use `docs/INTEGRATION_CHECKLIST.md` before copying, so linked primitives are not left behind.

## Use As An Agent Skill

- Copy `skills/d-nd-ux-ai-seed` into the assistant's skill directory when that system supports skills.
- For systems without skills, copy this `SKILL.md` body into the project instructions or agent memory.
- For Codex plugin/function systems, expose a command that opens this repo inventory and asks the agent to select the smallest reusable unit before editing.
- For Claude Code or similar coding agents, add a project instruction that points to this skill and the seed docs.

## Promotion Gate

A reusable element can move from project-specific UI to shared seed only when:

- private content has been removed;
- props and data contracts are named;
- mobile and desktop behavior are verified;
- closed, open, resize, overflow, and focus states are covered;
- the first safe action and side-effect boundary are documented.

# Completion Status

Status: ready seed baseline.

Last verification: `npm run typecheck`, `npm run build`, `npm run pack:dry`,
`git diff --check` and static `/ux-ai/` preview build on 2026-06-17.

## Completed Surface

- Three-column shell with external full-height closed gutters.
- `Shell3Col` `orientation` prop emits public `data-agent-*` and optional
  `data-thia-*` compatibility attributes directly on the active shell.
- Inner split panels with independent collapse, click reopen and drag reopen.
- Mobile inner split conversion from side-by-side to top/bottom.
- Hidden mobile scrollbars for dense panel surfaces.
- Compact workspace header.
- Point rail removed from generic workspace header and reserved for long
  articles, diagrams and chats.
- `MegaMenuSeed` for tabs, routes, template families and subdomain navigation.
- `ThiaChatSeed` / `AgentContextChatSeed` with awareness, drag, resize, explicit
  expansion, public + compatibility handoff events and full-screen mobile
  behavior.
- `AgentContextChatSeed` Lab-style Submit Module for "help us improve" flows,
  with fixed side tab, split chat/form layout, local fallback confirmation and
  optional host submit handler.
- Chat radius aligned to the design primitive contract: 8px surfaces and 4px
  compact controls.
- Chat drag contract aligned to the Lab surface: header drag only repositions;
  the expand button and lower-right grip are the only dimension controls.
- Chat expand control now opens a full-page working frame and restores the
  previous frame on the next click.
- Public `data-agent-*` orientation emitted by workspace demo, template,
  response outline, article diagram and taxonomy map, with `data-thia-*`
  compatibility preserved.
- Generic demo attribution with D-ND / THIA origin preserved in docs.
- Portable skills in `skills/d-nd-ux-ai-seed` and `skills/agentic-ux-seed`.
- Integration checklist for coders and external adopters.
- THIA design-seed linking guidance.
- Portfolio entry draft for D-ND/public technical portfolio.

## Verification Commands

```bash
npm run typecheck
npm run build
npm run pack:dry
```

## Manual QA Targets

- Mobile 500px: menu trigger is hamburger, not a full-width button.
- Mobile 500px: THIA opens as a full-screen surface.
- Mobile 500px: closed internal bottom book opens with click and drag.
- Desktop: megamenu panel stays grouped and does not lose active state.
- Desktop: THIA remains draggable and resizable, with no drag-direction resize.
- Package dry run includes `src`, `dist`, `docs`, `templates`, `demo`,
  `public` and `skills`.

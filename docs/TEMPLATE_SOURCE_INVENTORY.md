# Template Source Inventory

Status: first extraction inventory.

Purpose: identify useful UI/UX elements already coded across D-ND domains before
turning them into reusable templates. This is not the extraction itself. It is
the map for what should become easy to pick up later.

## Source Surfaces Checked

| Surface | Local source | Useful role |
| --- | --- | --- |
| Lab D-ND public site | `C:\PVSC\ANTI_G\lab-d-nd-site` | Domain lab landing, start funnel, cycle diagrams, offer tiers, DOMUS widget. |
| Seed landing | `C:\PVSC\ANTI_G\seed-landing` | Open Seed public page, concept cloud, command/start panel, support map. |
| Main D-ND site | `C:\PVSC\ANTI_G\d-nd_com_home_live` | Public shell, site map mega-menu, THIA chat, lab graph, admin/workspace surfaces. |
| Portable Seed repo | `C:\PVSC\ANTI_G\d-nd-seed` | Runtime/domain profiles, capability registry, hook/skill templates, researcher plugin. |

## Extraction Candidates

| Candidate | Source evidence | Reusable value | Candidate output |
| --- | --- | --- | --- |
| Public domain landing template | `lab-d-nd-site/index.html`, `lab-d-nd-site/d-nd-lab.html`, screenshots from `lab.d-nd.com` | Fast creation of a new domain/subdomain with consistent hero, sections, cards, offers and footer. | `templates/PublicDomainLanding/` |
| Start/domain intake page | `lab-d-nd-site/start.html` | Converts a domain, dataset or decision into a structured first-cycle request. | `templates/DomainStartPage/` plus intake form primitive. |
| Site mega-map navigation | `d-nd_com_home_live` public nav and screenshot of `d-nd.com` map | Large site navigation that orients without forcing linear menus. | `src/SiteMapMegaPanel.tsx` or template. |
| Top navigation shell | `lab-d-nd-site/assets/css/nav.css`, `seed-landing/index.html`, main-site nav | Shared brand/nav/lang/external links with mobile drawer. | `templates/PublicNavShell/` |
| Side vertical CTAs | `lab-d-nd-site/start.html`, screenshots: Help us improve / Support / Migliora | Persistent feedback/support entry without occupying main content. | `src/SideActionRail.tsx` |
| Domain route/process diagram | `lab-d-nd-site/start.html` hero input/output diagram | Shows input -> cycle -> output for domain onboarding. | `src/DomainCycleDiagram.tsx` |
| Lab cycle animated diagram | `lab-d-nd-site/d-nd-lab.html` cycle SVG/CSS | Reusable cycle/process animation for operational systems. | `src/CycleFlowDiagram.tsx` |
| Seed concept cloud | `seed-landing/index.html` `.seed-cloud` | Explains a system made of semantic nodes around a core. | `src/ConceptCloud.tsx` |
| Support map | `seed-landing/index.html` `.support-map` | Shows user support paths around a central need. | `src/SupportMap.tsx` |
| Feature/result card families | `lab-d-nd-site`, `seed-landing/styles.css`, screenshots | Consistent compact public cards, tiers, domain cards, proof cards. | `src/ui/CardSet.tsx` or CSS template tokens. |
| Offer tier grid | `lab-d-nd-site/start.html` `.tier-grid` | Reusable commitment/pricing/engagement selection. | `templates/OfferTierGrid/` |
| FAQ accordion | `lab-d-nd-site/start.html` `.faq` | Public page FAQ with compact dark styling. | `src/FaqAccordion.tsx` |
| Copyable command panel | `seed-landing/index.html` `.command-card` | Install/setup command block with copy affordance. | `src/CommandPanel.tsx` |
| Researcher/domain profile template | `d-nd-seed/plugins/researcher`, `profiles/*.json` | Non-visual domain setup model for new labs. | Docs + data contract, not UI first. |
| Agentic workspace graph | `d-nd_com_home_live/components/LabGraph.tsx`, `KnowledgeGraph.tsx` | Rich graph workspace with selection, detail, fullscreen and mobile constraints. | Later workspace template; too domain-heavy now. |
| Siteman/admin studio patterns | `d-nd_com_home_live/components/admin/SitemanStudio.tsx`, scheduler/admin panels | Authenticated operational workbench patterns. | Later admin/workbench seeds. |
| Assistant chat / DOMUS / THIA | `d-nd_com_home_live/components/Chatbot.tsx`, `lab-d-nd-site/assets/js/domus-widget.js`, chat docs | Complex assistant surface: floating, resizable, intake, contextual starters, memory handoff. | `src/ThiaChatSeed.tsx` baseline plus later intake/form track. |

## Immediate Template Groups

### 1. Public Domain Template Pack

Use when creating a new public domain/subdomain.

Should include:

- public nav shell;
- hero with domain proposition;
- domain cycle/input-output diagram;
- card sections for lead/result/process/application;
- offer/tier section when needed;
- FAQ and intake form;
- side action rail;
- footer with ecosystem links.

Primary sources:

```text
C:\PVSC\ANTI_G\lab-d-nd-site\index.html
C:\PVSC\ANTI_G\lab-d-nd-site\start.html
C:\PVSC\ANTI_G\lab-d-nd-site\d-nd-lab.html
```

### 2. Seed / System Explanation Pack

Use when a domain needs to explain an installable method, operating set-up or
capability system.

Should include:

- concept cloud;
- capability/feature cards;
- command panel;
- support map;
- bilingual nav/lang pattern.

Primary sources:

```text
C:\PVSC\ANTI_G\seed-landing\index.html
C:\PVSC\ANTI_G\seed-landing\styles.css
C:\PVSC\ANTI_G\d-nd-seed\capabilities\registry.json
```

### 3. Navigation / Orientation Pack

Use when a site has many adjacent surfaces and the user needs orientation
without losing the current page.

Should include:

- site map mega-panel;
- route groups;
- current page highlight;
- safe action / "where to start" hint;
- point-scroll/outline rail placed at the edge of the current surface, not in
  the content flow.

Primary sources:

```text
C:\PVSC\ANTI_G\d-nd_com_home_live\components\AppShell.tsx
C:\PVSC\ANTI_G\lab-d-nd-site\assets\js\nav.js
C:\PVSC\ANTI_G\lab-d-nd-site\assets\css\nav.css
```

### 4. Assistant Surface Pack

Baseline extracted as `src/ThiaChatSeed.tsx`. The remaining track is the deeper
intake/form/memory behavior from production THIA.

Useful behaviors to preserve later:

- floating compact assistant;
- smooth resize/drag;
- contextual page starters;
- split chat/form intake mode;
- mobile tabs for chat/form;
- persisted position, size and session;
- explicit no-publish/no-side-effect boundary;
- events: `community:intake:open`, `thia:trigger`;
- page awareness from `data-thia-*`.

Primary sources:

```text
C:\PVSC\ANTI_G\d-nd_com_home_live\components\Chatbot.tsx
C:\PVSC\ANTI_G\d-nd_com_home_live\docs\THIA_CHAT_ASSISTANT_GUIDE.md
C:\PVSC\ANTI_G\d-nd_com_home_live\docs\TM2_THIA_CHAT_UX_IMPORT_PLAN_2026-05-29.md
C:\PVSC\ANTI_G\lab-d-nd-site\assets\js\domus-widget.js
```

## First Extraction Order

1. Public nav shell + site map mega-panel.
2. Public domain landing template pack.
3. Domain start/intake page template.
4. Diagram primitives: domain cycle, concept cloud, support map.
5. Side action rail.
6. Offer tier grid and FAQ accordion.
7. Assistant surface pack.
8. Admin/workbench patterns.

## Promotion Boundary

Do not move a whole page into this repo as-is. Promote only when:

- content slots are separated from structure;
- route/link model is data-driven;
- mobile behavior is verified;
- language switching is explicit;
- side effects are declared;
- assistant/chat behavior is isolated from public page copy;
- the template can be populated for a new domain without editing private
  project state.

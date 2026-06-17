# Megamenu Seed

Status: reusable navigation pattern.

`MegaMenuSeed` is the navigation contract for tabs, page families, template
families and subdomain surfaces. It is modeled after the D-ND public site menu:
a compact trigger, a grouped dark panel, visible active states and enough
description to choose the next surface without guessing.

## Use When

- A workspace has multiple tabs or panel families.
- A public site needs route groups with stable intent.
- A seed repo exposes templates, docs, skills and reusable components.
- An assistant should receive handoff context from a menu item.

Do not use it as a generic decorative dropdown.

## Contract

Keep menu data structured:

```tsx
{
  id: 'templates',
  title: 'Templates',
  summary: 'Copyable starts for new domains.',
  items: [
    {
      id: 'template-chat',
      label: 'Agent context assistant',
      description: 'Assistant surface aware of open panels and focus.',
      status: 'seed',
    },
  ],
}
```

Required integration points:

- stable group ids;
- stable item ids;
- visible active item;
- short descriptions;
- optional `href` only for real navigation;
- optional `onSelect` for app state or assistant handoff.

## Mobile

On mobile the trigger becomes a hamburger icon. The text label remains
available to screen readers but does not occupy the full top row.

The panel stays compact, scrollable when necessary and hides its internal
scrollbar to avoid visual noise in dense workspaces.

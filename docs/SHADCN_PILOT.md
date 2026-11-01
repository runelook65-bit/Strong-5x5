# shadcn/ui pilot — architectural decision

Branch: feat/shadcn-settings-pilot (forked from design/shadcn-mobile-v09).
Isolation: pilot/ directory, independent Vite project, no modification to root production bundling.

## Decision

Validate the true React/shadcn/ui stack on a small settings screen before rewriting Today, Focus, Program or Progress. Preserve the existing JavaScript workout engine, state schema, record history and production branch. shadcn/ui is a component source layer, not a performance optimization or app-state migration.

## Included

- Real local MIT-licensed shadcn/ui Card, Button, Switch, Select, Dialog source files based on the official Radix new-york-v4 registry.
- React 19, TypeScript, Vite, Tailwind 4, semantic dark/emerald tokens.
- Interactive rest timer preference and sound toggle, with draft-only pilot storage.
- Confirmed reset dialog clearing the pilot key only.
- Read-only compatibility adapter for old arm_5x5_app_state_v1 preferences and session count.
- Explicitly inert tool rows to avoid falsely claiming 1RM/plaka data actions are migrated.

## Release gate

- No changes to root index.html, src/, root package.json, root workflow or main.
- No production deploy, PR merge or background monitoring.
- Node 22 test suite and build verification are mandatory. PR checks run npm test and npm run build on GitHub Actions, without deploying. The first CI verification passed (10/10 tests, Vite production build succeeded); browser visual QA remains open.
- Check source output and accessibility against 375px iPhone screenshot before deciding a broader migration.

Upstream docs: https://ui.shadcn.com/docs/installation/vite

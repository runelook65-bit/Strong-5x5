# ARM 5×5 — shadcn/ui Settings Pilot

Standalone React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui settings pilot.

## Run (Node >=22.12)

From the repository root:

    cd pilot
    npm install
    npm test
    npm run build
    npm run dev

Development preview: http://localhost:4174

The legacy single-page application at repository root is untouched. This pilot is not linked from the production build and has no production deploy configuration. The root app's npm scripts are unchanged.

## What is real

The Card, Button, Switch, Select and Dialog components are adapted from the official shadcn/ui MIT-licensed new-york-v4 (Radix) registry. The imported components are local source code, not screenshots or a style-only approximation. React and Radix own their interactions and accessibility.

Source: https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui

## Data-safety boundary

Production key: arm_5x5_app_state_v1 (READ ONLY).
Pilot key: arm_5x5_shadcn_settings_pilot_v1 (the only key this pilot writes/removes).

The pilot uses current legacy preferences as its initial values if same-origin storage is available. Pilot changes do not modify the legacy workout engine or saved records. The "reset pilot" dialog removes only pilot settings. On a different origin or port, browser storage is not shared: the summary will say no legacy data is present.

Tools shown in the pilot that do not yet have adapters are intentionally labelled unavailable and are not interactive. No simulated workout achievements, backups, or production actions.

## Next engineering gates

1. npm test and npm run build in a network-capable Node 22 environment.
2. Inspect 320 / 375 / 390 / 430px layouts, iPhone Safari and VoiceOver; verify Select / Dialog focus and safe areas.
3. Plan an explicit typed adapter for original settings actions; write tests for each before allowing mutations to production data.
4. Compare UX and bundle size with vanilla v0.9, then decide whether other screens should migrate.
5. Only after approval, make a release/migration plan. Never merge this experiment automatically.

## Maintenance

Components can be refreshed using the official CLI from this directory, after reviewing the generated diff:

    npx shadcn@latest add button card switch select dialog

Do not run this in the repository root.

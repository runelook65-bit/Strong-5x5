# ARM 5×5 v0.8 — Minimal Product UI

## Context

The first cover-heavy release was unpleasant on iPhone because the full-bleed generated hero used a low-resolution crop, consumed too much vertical space, and placed artwork behind interactive controls. A large floating bottom dock competed with the scrollable content. Dense emerald decoration also obscured the primary task.

This release fixes the information hierarchy, not just the color palette.

## Open-source design reference

- [shadcn/ui](https://github.com/shadcn-ui/ui) — MIT licensed, widely adopted, composable React+Tailwind UI components and design patterns.
- **Important architecture truth:** ARM 5×5 currently runs **vanilla JavaScript + Vite + Tailwind v3**. React shadcn/ui components are NOT imported or installed here. This is a deliberate framework-compatible implementation of its token, Card, Button, Badge, Tabs, and form design principles in `src/ui-system.css`, **not an official shadcn/ui installation**.
- Star-count accuracy: Bootstrap has more GitHub stars than shadcn/ui in the category of UI frameworks; GitHub popularity is a signal of community size, not mobile suitability. We retained shadcn visual direction because introducing Bootstrap on top of Tailwind creates avoidable style conflicts.

A future **real React+shadcn migration**, if justified, should first extract the existing training-data engine from `index.html`, write golden tests for `localStorage` and JSON migration, then replace one view at a time. Do **not** rewrite the program and persistence layer in a styling release.

## Design system

`src/ui-system.css` is loaded **after** the existing styles and owns the new design contract.

| Token | Purpose |
|---|---|
| `--ui-background` | neutral near-black app canvas |
| `--ui-foreground` | high contrast text |
| `--ui-card` | matte graphite task surfaces |
| `--ui-primary` | mint/emerald, reserved for the main action |
| `--ui-primary-foreground` | dark foreground on mint buttons |
| `--ui-muted` | subdued metadata |
| `--ui-border` | subtle, consistent separation |
| `--ui-ring` | keyboard focus |
| `--ui-radius` | consistent 10–14px corner scale |

Principles:
1. Do not use full-size generated athlete photography behind typography and controls.
2. Do not blur data cards and numeric inputs.
3. Each screen should have a single obvious primary action.
4. iPhone viewports need bottom content clearance even while the fixed tab bar is visible.
5. Keep all workout state, set progression, save/undo and JSON backup logic independent of imagery.

## What changed

**Today:** compact header, short next-workout panel, 49px Start button, three small numeric status blocks, 66px exercise rows, and compact recent session. The generated hero remains available in the repo but is deliberately not in the main task UI.

**Focus:** 108px exercise identity instead of a giant cover; 43px +/- controls and readable weight/reps; compressed set circles and buttons; distinct rest controls.

**Program:** shorter progress summary, clearer selected-day buttons, tight 12-week grid, and correct deload marker.

**Progress:** no repetitive marketing illustration between the user's metrics and their actual chart. All charts still come from their actual logs; no demo performance data.

**Settings:** small app identity panel, dense 52px rows, separate tools and data section.

**Bottom navigation:** matte compact 51px tabs instead of a 90–110px translucent dock; `safe-area-inset-bottom` used. Focus mode still hides tabs.

**Thumbnails:** all exercise-list rows use the same local SVG dumbbell mark rather than mismatched generated WebP/GIF assets. This does not delete existing exercise assets or technique data.

## Verification

- 73 existing/new main logic tests + 6 UI contract tests: **79/79 pass in a JavaScript simulation**, not a full real browser.
- HTML tag balance and CSS block balance verified independently in earlier passes.
- Real iPhone Safari, VoiceOver, pixel-level screenshot comparison and `npm run build` in a freshly installed Node environment are still required.

## Release boundary

- **GitHub source version:** v0.8.0 (unreleased)
- **Vercel production:** remains at the prior v0.7.2 deployment, with no production deployment performed as part of this change.
- Do not enable automatic Git push → production deploy.

## Next QA

- Test compact dock against iPhone Safari's browser toolbar at 375/390/430px and with an open keyboard.
- Check full session save, returning to a started session, and JSON export/import.
- Confirm extra-large accessibility text and reduced-transparency settings.
- If a genuine React/shadcn installation is wanted, first split the JS domain model into modules and schedule a migration with regression coverage.

# New project baseline — 2026-11-04

## Authoritative source
This repository replaces its former ARM 5×5 UI with the user-provided full standalone \`StrongLifts 5×5.html\` (root \`index.html\`). Keep new UI, logic and tests rooted in this document rather than rewriting the old 12-week ARM workout engine.

## Boundaries
- Original ARM Git state: \`archive/arm-5x5-v011\` (rollback).
- New app localStorage: \`sl5x5\`; legacy state: \`arm_5x5_app_state_v1\`.
- **Do not auto-convert**, reset or merge the old state into the new schema. The program types, session records and weight progression have different meanings. A future explicit, validated user-consented importer would be a separate feature.
- Existing Vercel project and domain retained so users can update the PWA. Workbox uses autoUpdate, skipWaiting, clientsClaim and cleanupOutdatedCaches.
- Retired active CSS files, the isolated shadcn pilot and legacy tests removed, but preserved by Git history.
- The uploaded HTML source is used unchanged; PWA manifest and package scripts belong to the deployment wrapper.

## QA
Node runtime smoke, new regression suite, Vite production build, and device Safari/VoiceOver acceptance are independent gates. No user data is held on the deployment server.

## Brand
The uploaded code names the third-party StrongLifts brand. Do not imply an official association or assume ownership of the name/logo.

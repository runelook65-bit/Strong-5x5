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


## Modular Vite refactor (v1.1.0)

Original inline style blocks were extracted to `src/styles/base.css`, `effects.css`, and `components.css` **without reordering declarations**. The JavaScript now uses an ES module entrypoint, domain config, state persistence, workout progression and display-format modules. The remaining screen controllers live in `src/app.js`, with a temporary `window` bridge to preserve inline HTML handler contracts. The localStorage key `sl5x5` and app behavior remain unchanged. This is not a React rewrite and does not re-enable the old ARM engine.

## Hardened recording and imports (2026-11-04)

- `src/data/validation.js` validates JSON backups and shared programs (structure, set/repetition limits, working weights, list sizes, identifiers, input length).
- Malformed imports are rejected **before** overwriting `sl5x5`. Persistence occurs before swapping the in-memory state; the retired `arm_5x5_app_state_v1` key stays untouched.
- Save failures display a user-facing notice rather than silently reporting success.
- Starting a session, completing sets, editing weights, saving a workout, discarding a session and resetting records now roll back in-memory changes if the browser rejects their storage write.
- Fatal app errors offer a readonly copy of local data and a retry button rather than encouraging an immediate one-click factory reset.
- Remaining gaps: full DOM/iPhone automated smoke tests; migrating `src/app.js` template-inline handlers to delegated events; storage corruption recovery on initial load; browser notifications cannot fire while the PWA is closed without a push-capable backend.

## Cold-start corruption safety

The storage module tracks invalid original records per storage object and refuses to overwrite the `sl5x5` key during ordinary UI actions. The app displays a recovery screen with a raw-data export view and a validated manual JSON restore action. Only explicitly approved, valid replacement data can unlock a blocked store. This avoids silently turning an invalid but potentially recoverable old record into blank workout history.

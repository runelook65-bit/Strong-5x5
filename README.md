# StrongLifts 5×5 — modular Vite application

This app is built from the user-supplied `StrongLifts 5×5.html` single-file baseline. The former 12-week ARM code is not active. **The Vite application is now split into real ESM source files**, while keeping the same workout engine, visual cascade and `sl5x5` localStorage data.

## Languages and startup

The UI defaults to **English**, with **Español** and **Türkçe** available under Settings → Language. The selection is stored in `sl5x5.lang`; existing records without a language setting also start in English. Opening or refreshing the application always shows Home. If a workout is still active, choose **Resume Workout** to continue without losing logged sets.

Translations affect on-screen presentation, date labels, accessibility labels and exercise technique instructions, not workout IDs or historical records. The PWA manifest uses English as its installation language.

## Run

Node.js 20.19+:

```bash
npm install
npm test
npm run dev
npm run build
npm run preview
```

The Vite production output is `dist/`. Existing Vercel/Netlify deployment configuration is unchanged.

## Source architecture

```text
index.html                     HTML shell only
src/main.js                    Vite entrypoint (imports CSS and app)
src/app.js                     Existing screen controllers and event handlers
src/data/storage.js            State initialization, localStorage read/write
src/domain/config.js           Exercises, workouts, barbell plates, UI colors
src/domain/workout.js          Upcoming schedules and 5×5 progression logic
src/lib/format.js              Date, weight and HTML text formatting
src/styles/base.css            Original typography, surfaces and base layout
src/styles/effects.css         Original gradients and visual effects
src/styles/components.css      Original mobile component and responsive rules
tests/stronglifts.test.cjs     Browser-equivalent smoke & functional tests
tests/architecture.test.cjs    Module contracts, data/state and parity checks
```

Stylesheet extraction preserves the *order of CSS rules from the original uploaded HTML*, avoiding visual drift.

### Compatibility bridge

The uploaded UI uses inline `onclick`, `oninput` and `onchange` handlers embedded in template strings. ES modules do not expose their lexical variables to `window` automatically. `src/app.js` deliberately exports the original action names and writable state handles to `window` as a **transitional compatibility bridge**. This allows us to modularize without breaking interactive behavior. A later PR should replace inline handlers with delegated events and then remove this bridge.

### Data continuity

- Active storage key: **`sl5x5`**; existing users retain their saved sessions, training plans, notes, weights and settings.
- Historical ARM key: **`arm_5x5_app_state_v1`**; remains untouched and is never silently imported or deleted.
- No server-side user database or account mechanism was added.
- The root Vercel project and its PWA caching strategy are preserved.

### Deliberate non-goals in this refactor

No visual redesign, framework rewrite, automatic data migration, training logic change, automatic live publishing or usage of the retired shadcn pilot. This PR is an architectural decomposition only.

## Legal/product note

The user-provided source uses the “StrongLifts” name. This repo is not asserted to be affiliated with that brand; evaluate naming rights before public commercial distribution.

## Nutrition (merged from feat/beslenme-kalori)

The Food/Nutrition tab supports manual meal entry, daily calorie/macro goals, photo capture and optional AI-assisted analysis. Records use `sl5x5_food`, independently of training data in `sl5x5`. Existing workout history and language settings are preserved. Photo estimates are approximations and not medical-grade nutrition measurements.

AI photo analysis requires the server-side Vercel environment variable `ANTHROPIC_API_KEY` (optional `ANTHROPIC_MODEL`). **Do not put API keys in the browser or commit them.** Without configuration, manual food entry remains available. The public serverless endpoint is not account-authenticated; restrict its usage before making the AI feature available to a broad audience, and set an API spend cap.

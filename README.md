# StrongFits — modular Vite application

This app is built from the user-supplied `StrongLifts 5×5.html` single-file baseline. The former 12-week ARM code is not active. **The Vite application is now split into real ESM source files**, while keeping the same workout engine, visual cascade and `sl5x5` localStorage data.

## Brand identity

User-visible app name, Home heading, browser title and PWA installation name are **StrongFits**. The default StrongFits 5×5 training plan is still the same A/B workout. GitHub repository name, live Vercel URL, historical source filename, icon asset path and existing localStorage keys (`sl5x5`, `sl5x5_food`) deliberately remain unchanged so existing installations and records continue to work.

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

The original user-provided baseline uses the third-party “StrongLifts” name; the app is now presented as **StrongFits**. This is an independent project and does not claim affiliation with StrongLifts. Research trademark and store-listing availability before commercial launch.

## Nutrition (merged from feat/beslenme-kalori)

The Food/Nutrition tab supports manual meal entry, daily calorie/macro goals, photo capture and optional AI-assisted analysis. Records use `sl5x5_food`, independently of training data in `sl5x5`. Existing workout history and language settings are preserved. Photo estimates are approximations and not medical-grade nutrition measurements.

AI photo analysis requires the server-side Vercel environment variable `OPENROUTER_API_KEY` (optional `OPENROUTER_MODEL`, restricted to free variants). The default is `google/gemma-4-26b-a4b-it:free`. **Do not put API keys in the browser or commit them.** Without configuration, manual food entry remains available. OpenRouter's free quota is limited. The serverless endpoint is unauthenticated, and Origin checks are not effective protection against scripted abuse; add an authenticated per-user quota/rate limiter before offering public production photo analysis. Adding or updating Vercel secrets requires a fresh deployment.

## Workout safety and icon update (November 2026)

- New installs use conservative default working weights; a first-use settings sheet allows personalized weights and training weekdays. Existing users' stored weights are preserved.
- The default Deadlift workout logs one working set of five; all other standard lifts log five sets of five.
- Unattempted or interrupted sets do not accrue deload failure counters or automatic progression.
- Progress charts and estimated one-rep maximums reflect performed sets, never the next target weight.
- Upcoming workouts are projected using configured weekdays (Monday/Wednesday/Friday by default).
- The installed fork-and-dumbbell PWA SVG icon replaces the legacy barbell symbol.
- A Vercel WAF rule limits POST /api/food/analyze requests to five per IP each 60 seconds. This is not account authentication; add per-account identity and quotas before commercial launch.

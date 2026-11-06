# StrongLifts 5×5 — HTML baseline

**Current app:** the user-supplied \`StrongLifts 5×5.html\`, copied verbatim to the repository root \`index.html\`. All subsequent application work uses **this HTML source**. It is a standalone HTML/CSS/JavaScript app, *not* the former ARM 5×5 React/shadcn pilot or the old 12-week arm tracker.

Production URL (when deployed): https://arm-5x5.vercel.app

## Local use

Use Node 20.19+:

\`\`\`bash
npm install
npm test
npm run build
npm run dev
\`\`\`

Vite and vite-plugin-pwa wrap the single HTML file for deployment. The build output goes to \`dist/\`; no legacy CSS, shadcn pilot or ARM JS is imported into the app.

## Workout features from the supplied file

- Default A/B StrongLifts 5×5 routines, editable weights and increment settings.
- Workout overview with set circles, rest timer and notes.
- History list/calendar/notes, exercise progression graphs, warm-up guidance.
- Custom workout/program editor, settings, accent themes, local backup import/export.
- Data stored in browser \`localStorage\`, key \`sl5x5\`.

## IMPORTANT: data boundary

The retired ARM 5×5 version stored its user records under \`arm_5x5_app_state_v1\`. This uploaded program uses an **incompatible state schema** at \`sl5x5\`.

**No automatic migration or deletion of the old records is performed.** The new app starts with its own storage key; overwriting browser data or clearing site storage can destroy either key. The retired source is backed up on Git branch \`archive/arm-5x5-v011\`. Contact the developer for a reviewed export/migration path if historic ARM records must be imported.

## Historical source and cleanup

All retired ARM app code, styles, old tests, unused media, outdated documentation and the shadcn pilot were removed from the *current code tree*. They remain in Git history and the archive branch for rollback.

The SVG icon is a generic inherited barbell/5×5 visual with updated accessible title, not the retired product name.

## Release safety

- \`npm test\` verifies JS startup, workout progression, storage isolation, settings and preserved source behavior.
- \`npm run build\` verifies Vite/PWA packaging.
- Test real iPhone Safari/PWA install and refresh before accepting production UX; the supplied file makes no claim of native iOS equivalence.
- The source uses the name “StrongLifts”; independently assess brand/trademark rights before commercial distribution. Uploading the file does not establish an affiliation with the original StrongLifts product.

## Beslenme (fotoğrafla kalori takibi)

The **Beslenme** tab photographs a meal, sends a downscaled JPEG to `api/food/analyze.js` (a Vercel serverless function) and shows estimated calories, protein, carbs and fat per item. Users can change portions, remove items, send a correction note for a re-analysis, add meals by hand and set daily goals.

- Nutrition data lives in its own `localStorage` key, `sl5x5_food`; the workout state in `sl5x5` is not changed.
- Required Vercel environment variable: `ANTHROPIC_API_KEY`. Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) and `ALLOWED_ORIGINS` (comma-separated extra origins).
- Without the key the endpoint returns `503 not_configured` and the app offers manual entry.
- The endpoint only accepts same-origin POSTs; set a monthly spend limit on the Anthropic account as well.

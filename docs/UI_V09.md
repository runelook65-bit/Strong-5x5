# ARM 5×5 — v0.9 Mobile UI / shadcn-informed redesign

## Why this exists

In the supplied iPhone screenshots, the earlier version displayed oversized artwork and cards, competing glows, redundant navigation surfaces and workouts that required excess scrolling. The design priority is task clarity rather than decorative effects.

We are **using shadcn/ui's accessible design conventions and component hierarchy as a reference**, but the current app uses plain HTML/CSS/JS; **the shadcn React components are not installed**. The official Vite integration uses React and a Tailwind-oriented component project, which requires a separate, staged migration. See https://ui.shadcn.com/docs/installation/vite and https://github.com/shadcn-ui/ui (MIT).

## Implemented on design/shadcn-mobile-v09

### 1. Today — short primary action
- Next-session card shows Workout A/B, real exercise/set counts, current recorded status and a single prominent **Antrenmanı Başlat / Devam Et** action.
- The three numbers (week, sessions, arm circumference change) share **one compact neutral strip**, instead of three large competing cards.
- Exercises remain an actual clickable list from the user's selected program template, with consistent small SVG symbols. No hero photographic overlay.
- Last recorded workout stays below today's plan, as a quiet secondary item.

### 2. Active Workout — direct set entry
- A compact exercise heading presents the current movement and **actual completed/total sets**.
- **Total KG** and **Tekrar** are displayed side-by-side in two contained inputs.
- Tapping a number opens the existing numeric editor; -/+ adjust values. Min tap target 44px.
- **Seti Tamamla** remains the sole primary action, using the original `recordExerciseSet` and timer logic.
- Set progress, optional recovery, previous/next movement and finish confirmation are preserved.
- All workout record and backup schemas stay unchanged.

### 3. Design system
- Neutral surfaces, one emerald primary color, clear type scaling and 13px card radius.
- `src/ui-v09.css` is the **only active application UI theme**, loaded after structural `src/v7.css`. Historical `v7-glass.css` and `ui-system.css` are **not loaded**.
- Opaque metric surfaces ensure keyboard-entry readability; small transparency only in fixed navigation.
- Real icons are retained, but photo covers are not in the workout experience.

### 4. Program — compact weekly planner
- One progress summary shows the actual recorded completed slots, current week, and 36-session progress indicator.
- Weekly A/B/A or B/A/B days show separate selected/completed states with accessible labels.
- Workout A/B cards display the selected template’s actual exercises and set×rep goals; they continue using the existing override confirmation.
- The original template selector, deload/week controls, and workout engine remain unchanged in behavior and storage format.
- The 12-week roadmap and training rationale move to expandable disclosure cards to reduce initial scroll.
- CSS scoped to `#v7Program` / `ui9-program-*`; tap targets are at least 44 CSS pixels.

### 5. Progress — recorded performance, not an achievement mockup
- A compact three-metric strip reuses the existing recorded session count, total kg work volume, and cold-arm circumference delta.
- Strength chart stays selectable by exercise and uses persisted exercise history; the latest 12 valid measurements are visualized, with a dedicated no-data message.
- The 12-week volume chart still reads from recorded workouts and now notes data coverage. No demo values or fabricated sessions.
- Personal-record rows read the maximum valid set weight per exercise; empty results have an explicit state.
- Cold/pump arm readings and the original measurement/history actions are preserved.
- Layout is CSS-scoped to `#v7Progress` / `ui9-progress-*`; 44px tap targets and stable offline storage are preserved.
- Existing chart implementations are retained. The metrics are not clinical indicators or strength estimates.

## Not yet done

- [ ] Actual React + shadcn/ui component installation and engine adapter — do **not** attempt this by replacing the workout engine before data migration and behavior tests.
- [ ] Browser screenshots at 320/375/390/430 CSS pixels; verify no horizontal overflow and no obscured form controls.
- [ ] iOS Safari/ChatGPT browser bottom toolbar / home indicator / safe-area integration.
- [ ] VoiceOver and enlarged text QA; keyboard number editor focus.
- [ ] Test resumed workout, week-7 deload, older JSON import/export and undo in real browsers.
- [ ] Independent `npm install && npm test && npm run build` in a Node 20.19+ checkout.
- [ ] Performance and contrast audit with actual device screenshots.
- [ ] User approval before merging or publishing.

## Release boundary

Only development branch `design/shadcn-mobile-v09` is changed.
- `main`: preserved
- `https://arm-5x5.vercel.app`: preserved
- New source version: `0.9.0-dev`

The code-level regression simulations are not a substitute for real mobile device testing.

## v0.10 Guided Exercise UI (reference-based feature)
The supplied App Store screenshot is a product-experience reference, not a license to reuse its imagery or program. ARM 5×5 retains its original 12-week alternating A/B programming and recording algorithms.

- Today exercise rows now render existing per-exercise catalog photos in one consistent thumbnail frame, with actual selected template set and rep targets.
- Focus shows a large photo reference with an actionable **Nasıl yapılır?** button.
- A new accessible sheet displays the existing exercise database name, short explanation, technique guidance and rest recommendation. It can be closed by the explicit button, Escape or backdrop, with keyboard Tab wrapping and return focus.
- All instructions and imagery originate from the application's existing exercise catalog; the guide does not write, reset or synthesize a workout log.
- The illustration is clearly marked as a static photograph, not a video or moving demonstration.
- No third-party assets from the reference screenshot were copied.
- QA gate: npm test, production build and mobile Safari checks (320 / 375 / 390 / 430px, VoiceOver) before merging into production.

The feature remains on branch `feat/guided-exercise-experience` pending verification.

## v0.11 — Screenshot-inspired dark/red strength-training UI
The supplied StrongLifts screenshots guide layout and visual hierarchy only. ARM 5×5 retains its own branding, exercises, 12-week program, A/B alternation, saved weights and progression rules. No third-party media or sample achievements are copied.

- Home: original session prescription, saved real working weights and recorded-set count; next two planned week/day slots without inventing absolute future dates.
- Focus: an across-exercise overview of large set circles; red means a recorded set, grey means pending. Taps open the existing editor and weight/repetition logger. Warm-up is informational and does not log a set.
- History: five-tab navigation with list, calendar and read-only notes from actual saved workout timestamps and exercises. No fake dates, entries or trends.
- Program, Progress and Settings: unchanged state engine, recolored in the unified dark/red UI.
- Compatibility: persistence key arm_5x5_app_state_v1, backup/restore and recorded set logic are unchanged.
- QA gate: independent npm test and Vite build; device testing still needed on 320/375/390/430px, iOS Safari/VoiceOver and PWA service worker. No automatic deployment.

# StrongFits photo analysis: authentication and quotas

## Scope and data boundaries
This change secures the optional online photo-analysis route. Workout data and manual nutrition records remain local on the same device in their original localStorage keys, sl5x5 and sl5x5_food. Google sign-in does not synchronize the local records.

## Request flow
1. When the user selects a photo, the app checks GET /api/food/config.
2. Google Identity Services loads on demand. The signed Google ID credential stays only in memory.
3. POST /api/food/analyze receives the credential in the Authorization: Bearer request header.
4. The backend verifies Google's RS256 signature against official JWKS, and checks exact audience, issuer, expiry, issued-at and stable subject (sub). Email is never used as the account identifier.
5. A daily per-account Redis counter is atomically checked and consumed using EVAL before calling OpenRouter.
6. Invalid/expired tokens, unavailable Google identity verification, missing credentials, missing Redis, Redis errors and quota exhaustion fail closed. Manual meal entry stays available.

## Required services and environment variables
Create a Google OAuth 2.0 Web application client ID and configure Authorized JavaScript origins for each deployed domain, including https://arm-5x5.vercel.app. No client secret belongs in browser code.

Create a dedicated Upstash Redis database for StrongFits. Do not reuse the production database of an unrelated product.

Set these environment variables directly in the Vercel arm-5x5 project:
- OPENROUTER_API_KEY: existing secret, free-only model
- GOOGLE_CLIENT_ID: public OAuth client ID, server-side audience
- UPSTASH_REDIS_REST_URL: HTTPS URL of a dedicated Upstash database
- UPSTASH_REDIS_REST_TOKEN: Upstash REST secret, server only
- FOOD_AI_DAILY_LIMIT: optional, 12 by default (clamped 1–50), one quota per Google account per UTC day
- FOOD_AI_GLOBAL_DAILY_LIMIT: optional, 40 by default (clamped 1–1000), global quota across the entire app per UTC day. Set no higher than your OpenRouter account's real free allowance, leaving headroom for other uses.
- ALLOWED_ORIGINS: optional additional browser origins if deliberately required

Configure production and preview environments separately. Never paste API keys into GitHub issues, code, conversations, or documentation. Every Vercel environment variable update requires a fresh deployment.

## Security behavior
The quota keys include a SHA-256 hash of Google's stable subject (not email or plain user ID) and an app-wide global count. Both counters expire after the next UTC midnight. The quota counts attempted valid image analyses, including upstream errors, because requests may incur external resource usage. Quota checks use a single atomic Redis operation that checks and increments both the user and app-wide counters, preventing concurrent overuse. No token, raw photo or Redis secret is persisted in Redis.

The existing Vercel WAF rate limit (five POST requests/IP/minute) stays in place as a separate layer. Multiple Google accounts could otherwise circumvent per-account limits; retain WAF and upstream usage controls.

## Verification and release checklist
Run npm test, npm run build and npm run test:e2e; automated CI now checks Chromium and WebKit viewports. Before production:
- Validate Google login on the real deployment and on iPhone Safari.
- Test a valid token, forged or expired token, mismatched audience, full daily quota and Redis outage.
- Verify neither unauthorized requests nor quota exhaustion can reach OpenRouter.
- Verify iPhone PWA install, camera permissions and VoiceOver, and that manual logging remains usable.
- Verify existing records in sl5x5 and sl5x5_food remain unchanged.
- Keep the production release unchanged until Google client ID and dedicated Redis credentials are configured and these acceptance checks pass.

WebKit browser automation is not equivalent to testing a physical iPhone or actual VoiceOver.


## Real-photo probe (2026-11-10 UTC)
A **one-time** GitHub Actions check (run [42921151824](https://github.com/runelook65-bit/Strong-5x5/actions/runs/42921151824)) used two publicly licensed Wikimedia Commons photographs: [MenemenIstanbul](https://commons.wikimedia.org/wiki/File:MenemenIstanbul.jpg) and [Spaghetti bolognese](https://commons.wikimedia.org/wiki/File:Spaghetti_bolognese.jpg). Both were fetched successfully and sent as one POST each to the **existing production endpoint** (prior to the changes in this feature branch).

Result: both returned **HTTP 429 `{"error":"busy"}`**, which is the existing server's mapping for a rate-limited OpenRouter response. **No real-model nutrition estimate was obtained.** This may represent free-account daily quota or provider congestion; the API currently discards upstream diagnostic details. The ephemeral CI probe was removed after the result to avoid repeated live calls.

### Re-validation after external services are configured
1. Configure Google OAuth Web client and a dedicated Upstash Redis instance. Set `GOOGLE_CLIENT_ID`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in the appropriate Vercel preview environment. Use a separate OpenRouter key/workspace for preview (do not copy or expose a production secret), and set `OPENROUTER_API_KEY`.
2. Deploy and open the **preview**, confirm `/api/food/config` reports `enabled: true`, sign in to the photo flow, and confirm a request reaches OpenRouter only after Google token verification and quota acceptance.
3. Test one photograph each of a single-component dish and mixed dish with known weighed ingredients. Record item recognition, estimated grams, kcal/macros, response code, latency and manual corrections. Without ground truth weights, this is only a structural smoke test, not an accuracy benchmark.
4. Test wrong audience/expired token, quota exhaustion and Redis outage before production rollout. Failed upstream free calls consume quota; do not blindly retry.
5. Keep the existing production deployment unchanged until the live end-to-end test and access controls pass.

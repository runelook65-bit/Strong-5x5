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
- ALLOWED_ORIGINS: optional additional browser origins if deliberately required

Configure production and preview environments separately. Never paste API keys into GitHub issues, code, conversations, or documentation. Every Vercel environment variable update requires a fresh deployment.

## Security behavior
The quota key includes a SHA-256 hash of Google's stable subject, not an email or plain user identifier. The counter expires after the next UTC midnight. The quota counts attempted valid image analyses, including upstream errors, because requests may incur external resource usage. Quota checks use a single atomic Redis operation to prevent concurrent overuse. No token, raw photo or Redis secret is persisted in Redis.

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

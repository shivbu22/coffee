# FindCo

FindCo is a companionship platform for India — discover verified companions ("buddies") by city, post activity requests, chat, book with escrow-style handshake verification, and unlock membership passes.

> Note: this repository was originally named `coffee` on GitHub. The product is FindCo; the name was not changed in code.

## Stack

- React 19 + Vite (SPA)
- **Cloudflare-only backend** — Pages Functions (API + auth) + D1 (SQLite database). No Supabase: the previous Supabase version is in git history (commit `bc2db71`); `supabase_schema.sql` is kept as legacy reference only.
- Razorpay — real payments via Pages Functions (orders, signature verification, webhooks, D1 fulfilment)
- Cloudflare Pages — hosting, security headers, SPA fallback

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the public VITE_ values
npm run build
npx wrangler d1 execute DB --local --file cloudflare/schema.sql   # one-time local DB
npx wrangler pages dev dist --d1 DB --port 8788                   # app + API + D1
```

## Environment variables

Public (build-time, in `.env.local` locally / Cloudflare Pages settings in production):

| Variable | Purpose |
|---|---|
| `VITE_RAZORPAY_KEY_ID` | Razorpay **public** Key ID (`rzp_test_...` or `rzp_live_...`) |
| `VITE_BACKEND_MODE` | Optional. `local` forces the offline/demo UI; unset = Cloudflare API |

Server-only secrets — set **only** in Cloudflare Dashboard → Pages → findco → Settings → Environment variables. Never prefix them with `VITE_`, never commit them:

`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and optionally `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google sign-in), `RESEND_API_KEY` + `OTP_FROM_EMAIL` (email OTP), `ENVIRONMENT=production`.

## Cloudflare setup (D1)

1. `npx wrangler d1 create findco` — paste the printed `database_id` into `wrangler.toml` (replacing `REPLACE_AFTER_WRANGLER_D1_CREATE`).
2. `npx wrangler d1 execute findco --remote --file cloudflare/schema.sql` — creates all tables (users, sessions, otp_codes, login_attempts, companions, activity_requests, bookings, chat_messages, hallmark_credentials, payments, subscriptions, support_tickets) plus seed companions.
3. Set the env vars/secrets above in Pages settings, then deploy.

### First admin

Admins are never creatable through signup (role is clamped to `client`/`buddy` server-side). Promote an existing account directly in D1:

```bash
npx wrangler d1 execute findco --remote --command "UPDATE users SET role='admin' WHERE email='you@example.com'"
```

### Auth model

- Email/password: PBKDF2-SHA256 (100k iterations, per-user salt, WebCrypto) in `functions/_lib/auth.js`.
- Sessions: 32-byte random token; only its SHA-256 hash is stored; delivered as an `HttpOnly; Secure; SameSite=Lax` cookie (`findco_session`, 30 days).
- OTP: 6-digit, hashed at rest, 10-minute expiry, max 5 attempts. Email delivery via Resend when `RESEND_API_KEY` is set; in non-production (`ENVIRONMENT` ≠ `production`) the code is returned in the API response for local testing — never in production.
- Login rate limit: 10 failed attempts per identifier per 15 minutes → HTTP 429.
- Google sign-in: full OAuth2 code flow at `/api/auth/google/start` + `/callback` (state-cookie CSRF check). Env-gated: without `GOOGLE_CLIENT_ID/SECRET` the start route returns 501. The flow is a top-level browser redirect, so no CSP change is needed for accounts.google.com.
- Chat "realtime" is 3-second polling from the frontend shim (no websockets on D1).

## Security model (RLS replacement)

There is no Row Level Security in D1 — **every Pages Function handler enforces authorization server-side**, using the session user loaded from D1 (never client input or metadata):

- Profiles: own row only; `role`/`email`/`id` are not writable via the API.
- Companions: public read; create sets `user_id` = session user; update requires owner or admin.
- Requests: clients see their own; buddies see OPEN + their own; admins see all. Create forces `client_id` = session user.
- Bookings: list/create/verify-PIN restricted to participants; PIN check returns an identical error for wrong PIN vs unknown booking.
- Messages: room participants only (first message establishes participation); `sender_id` is forced to the session user.
- Payments/subscriptions: written only by the server (Razorpay verify/webhook with HMAC signature checks).
- The frontend client (`src/lib/supabaseClient.js`, a compat shim keeping the old exported names) holds no keys and no secrets.

## Razorpay setup

1. Create keys in Razorpay Dashboard → Settings → API Keys.
2. Set `VITE_RAZORPAY_KEY_ID` (public) at build time, and `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` as Cloudflare secrets.
3. Add a webhook in Razorpay Dashboard → Webhooks pointing to `https://<your-domain>/api/payments/webhook`, set its secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Flow: browser → `POST /api/payments/create-order` (amount decided server-side from a fixed plan map in `functions/api/payments/_plans.js`; pending payment recorded in D1) → Razorpay Checkout → `POST /api/payments/verify` (HMAC-SHA256 signature check; fulfils into D1 `payments` + `subscriptions`) → webhook confirms fulfilment as backup. Without a D1 binding, fulfilment degrades to log-only.
5. If `VITE_RAZORPAY_KEY_ID` is not set, the subscription modal runs in clearly labelled **DEMO MODE** and makes no real charge.

## Deploy — Cloudflare Pages

1. Cloudflare Dashboard → Pages → Create → connect this repo (or run `npx wrangler pages deploy dist`).
2. Build command: `npm run build` · Output directory: `dist` (see `wrangler.toml`, project name `findco`).
3. Set all env vars above in Pages settings, then redeploy.
4. `public/_headers` ships CSP/HSTS and other security headers; `public/_redirects` provides the SPA fallback. API endpoints live in `functions/api/`.
